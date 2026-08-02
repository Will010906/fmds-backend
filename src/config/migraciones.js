// ============================================================================
// Migraciones automáticas de arranque
// ----------------------------------------------------------------------------
// Al iniciar el servidor se verifica que las tablas tengan las columnas que el
// código espera y, si falta alguna, se agrega. Esto mantiene sincronizada la
// base de datos de producción (alojada en Railway) con el código desplegado,
// sin tener que ejecutar los scripts SQL a mano tras cada despliegue.
//
// Solo se agregan columnas nuevas que admiten nulos o tienen valor por defecto:
// nunca se elimina ni se modifica información existente. Si algo falla, se
// registra en consola pero el servidor continúa arrancando.
// ============================================================================
const db = require('./db');

// Tablas que deben existir. Se crean con IF NOT EXISTS, así que volver a
// ejecutarlas no afecta a las que ya tienen información.
//
// Están todas, no solo las nuevas: al mover el proyecto a otra cuenta de
// Railway la base arranca vacía, y si el código da por hecho que las tablas
// ya existen, los endpoints responden 500 hasta que alguien ejecute el SQL a
// mano. Con la lista completa, apuntar a una base nueva basta para que el
// esquema se levante solo en el primer arranque.
//
// El orden importa: una tabla con clave foránea necesita que la tabla a la
// que apunta ya exista, y los objetos de JavaScript conservan el orden en que
// se escriben las claves.
const TABLAS_ESPERADAS = {
  usuario: `CREATE TABLE IF NOT EXISTS usuario (
    idUsuario   INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    correo      VARCHAR(100) NOT NULL UNIQUE,
    contrasenia VARCHAR(255) NOT NULL,
    rol         VARCHAR(30) NOT NULL DEFAULT 'Usuario General',
    esInvitado  TINYINT(1) NOT NULL DEFAULT 0
  ) ENGINE=InnoDB`,

  evento: `CREATE TABLE IF NOT EXISTS evento (
    idEvento     INT AUTO_INCREMENT PRIMARY KEY,
    titulo       VARCHAR(200) NOT NULL,
    fecha        DATE NOT NULL,
    precio       FLOAT NOT NULL,
    stockBoletos INT NOT NULL
  ) ENGINE=InnoDB`,

  transaccion: `CREATE TABLE IF NOT EXISTS transaccion (
    idTransaccion VARCHAR(50) PRIMARY KEY,
    idUsuario     INT NOT NULL,
    fechaPago     DATETIME NOT NULL,
    montoTotal    FLOAT NOT NULL,
    CONSTRAINT FK_transaccion_usuario FOREIGN KEY (idUsuario)
      REFERENCES usuario (idUsuario) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE=InnoDB`,

  detalle_compra: `CREATE TABLE IF NOT EXISTS detalle_compra (
    idDetalle     INT AUTO_INCREMENT PRIMARY KEY,
    idTransaccion VARCHAR(50) NOT NULL,
    idEvento      INT NOT NULL,
    cantidad      INT NOT NULL,
    CONSTRAINT FK_detalle_transaccion FOREIGN KEY (idTransaccion)
      REFERENCES transaccion (idTransaccion) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_detalle_evento FOREIGN KEY (idEvento)
      REFERENCES evento (idEvento) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE=InnoDB`,

  articulo: `CREATE TABLE IF NOT EXISTS articulo (
    idArticulo       INT AUTO_INCREMENT PRIMARY KEY,
    titulo           VARCHAR(255) NOT NULL,
    cuerpo           TEXT NOT NULL,
    autor            VARCHAR(150) NOT NULL,
    categoria        VARCHAR(100) NOT NULL,
    fechaPublicacion DATE NOT NULL
  ) ENGINE=InnoDB`,

  speaker: `CREATE TABLE IF NOT EXISTS speaker (
    idSpeaker INT AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(150) NOT NULL,
    rol       VARCHAR(150) NOT NULL,
    area      VARCHAR(60)  NOT NULL,
    tema      VARCHAR(255) NOT NULL,
    frase     TEXT NULL,
    featured  TINYINT(1) NOT NULL DEFAULT 0,
    fotoUrl   VARCHAR(500) NULL,
    creadoEn  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,

  suscriptor: `CREATE TABLE IF NOT EXISTS suscriptor (
    idSuscriptor INT AUTO_INCREMENT PRIMARY KEY,
    correo       VARCHAR(150) NOT NULL UNIQUE,
    creadoEn     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,

  sesion: `CREATE TABLE IF NOT EXISTS sesion (
    idSesion  INT AUTO_INCREMENT PRIMARY KEY,
    idEvento  INT NULL,
    idSpeaker INT NULL,
    dia       INT NOT NULL,
    hora      TIME NOT NULL,
    duracion  VARCHAR(20) NOT NULL,
    tipo      VARCHAR(60) NOT NULL,
    nombre    VARCHAR(255) NOT NULL,
    ponente   VARCHAR(150) NOT NULL,
    badge     VARCHAR(20) NOT NULL DEFAULT 'Keynote',
    CONSTRAINT FK_sesion_evento  FOREIGN KEY (idEvento)  REFERENCES evento(idEvento)   ON DELETE SET NULL,
    CONSTRAINT FK_sesion_speaker FOREIGN KEY (idSpeaker) REFERENCES speaker(idSpeaker) ON DELETE SET NULL
  ) ENGINE=InnoDB`,

  curso: `CREATE TABLE IF NOT EXISTS curso (
    idCurso     INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    horas       INT NOT NULL,
    nivel       VARCHAR(50) NOT NULL,
    precio      DECIMAL(10,2) NOT NULL,
    descripcion TEXT NOT NULL,
    badge       VARCHAR(20) NULL
  ) ENGINE=InnoDB`,

  mensaje: `CREATE TABLE IF NOT EXISTS mensaje (
    idMensaje INT AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(150) NOT NULL,
    correo    VARCHAR(150) NOT NULL,
    asunto    VARCHAR(60)  NOT NULL DEFAULT 'Consulta general',
    mensaje   TEXT NOT NULL,
    creadoEn  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,

  paquete: `CREATE TABLE IF NOT EXISTS paquete (
    idPaquete       INT AUTO_INCREMENT PRIMARY KEY,
    idEvento        INT NOT NULL,
    nombre          VARCHAR(100)  NOT NULL,
    descripcion     VARCHAR(255)  NULL,
    cantidadBoletos INT           NOT NULL,
    precio          DECIMAL(10,2) NOT NULL,
    destacado       TINYINT(1)    NOT NULL DEFAULT 0,
    activo          TINYINT(1)    NOT NULL DEFAULT 1,
    CONSTRAINT FK_paquete_evento FOREIGN KEY (idEvento)
      REFERENCES evento(idEvento) ON DELETE CASCADE
  ) ENGINE=InnoDB`,
};

// Columnas esperadas por tabla: { tabla: { columna: definición SQL } }
//
// Aquí van las columnas que el código lee, no solo las que se agregaron con
// el tiempo. Una base importada de otro lado puede traer la tabla con menos
// columnas de las que las consultas piden, y el resultado es un 500 opaco:
// la tabla existe, así que nada avisa de que le falta algo.
const COLUMNAS_ESPERADAS = {
  // La cuenta creada al comprar sin registro se marca como invitada para
  // poder reclamarla luego con el mismo correo.
  usuario: {
    esInvitado: 'TINYINT(1) NOT NULL DEFAULT 0',
  },
  // fotoUrl es opcional en la ficha del ponente, pero las consultas de la
  // agenda la piden por nombre para mostrar su retrato junto a la sesión.
  speaker: {
    fotoUrl:  'VARCHAR(500) NULL',
    frase:    'TEXT NULL',
    featured: 'TINYINT(1) NOT NULL DEFAULT 0',
  },
  curso: {
    badge: 'VARCHAR(20) NULL',
  },
  evento: {
    descripcion: 'TEXT NULL',
    sede:        'VARCHAR(150) NULL',
    ciudad:      'VARCHAR(100) NULL',
    hora:        'TIME NULL',
    modalidad:   "VARCHAR(30) NOT NULL DEFAULT 'Presencial'",
  },
  // Una sesión pertenece a un evento y puede impartirla un ponente del
  // catálogo. Ambas admiten nulos: la agenda existía antes que estas
  // relaciones, y no toda sesión la da una persona registrada (hay paneles,
  // comités y actividades abiertas que siguen usando el texto libre).
  //
  // Se listan además las columnas de contenido. Al mover el proyecto de
  // cuenta apareció una base cuya tabla `sesion` no coincidía con la que el
  // código espera, y cualquier consulta a la agenda respondía 500. Con la
  // lista completa, una tabla incompleta se termina de armar sola. Los
  // valores por defecto permiten agregarlas aunque ya haya filas dentro.
  sesion: {
    idEvento:  'INT NULL',
    idSpeaker: 'INT NULL',
    dia:       'INT NOT NULL DEFAULT 1',
    hora:      "TIME NOT NULL DEFAULT '09:00:00'",
    duracion:  "VARCHAR(20) NOT NULL DEFAULT '60 min'",
    tipo:      "VARCHAR(60) NOT NULL DEFAULT 'Sesión'",
    nombre:    "VARCHAR(255) NOT NULL DEFAULT ''",
    ponente:   "VARCHAR(150) NOT NULL DEFAULT ''",
    badge:     "VARCHAR(20) NOT NULL DEFAULT 'Keynote'",
  },
};

// Enlaza por única vez las sesiones ya cargadas con su ponente del catálogo.
//
// La agenda se capturó antes de que existiera la relación, con el ponente como
// texto libre ("Dra. Ana López · TEC de Monterrey"). Aquí se liga cada sesión
// cuyo texto contenga el nombre completo de un ponente registrado.
//
// Se exige el nombre completo, no el apellido, justamente para no confundir a
// dos personas que comparten apellido. Y solo se ejecuta si ninguna sesión
// tiene ponente asignado: en cuanto alguien empieza a asignarlos desde el
// panel, esta función deja de tocar nada para no deshacer su trabajo.
const enlazarPonentesUnaVez = async () => {
  try {
    const [[{ n }]] = await db.query('SELECT COUNT(*) AS n FROM sesion WHERE idSpeaker IS NOT NULL');
    if (n > 0) return; // ya hay asignaciones hechas a mano: no se toca

    // Las dos tablas pueden haberse creado con cotejamientos distintos
    // (utf8mb4_0900_ai_ci en una y utf8mb4_unicode_ci en otra, según de dónde
    // venga cada importación). MySQL se niega a comparar texto entre
    // cotejamientos diferentes, así que se fuerza uno común en la comparación.
    const [enlazadas] = await db.query(`
      UPDATE sesion s
      JOIN speaker sp
        ON (s.ponente COLLATE utf8mb4_general_ci)
           LIKE (CONCAT('%', sp.nombre, '%') COLLATE utf8mb4_general_ci)
      SET s.idSpeaker = sp.idSpeaker
      WHERE s.idSpeaker IS NULL
    `);
    if (enlazadas.affectedRows > 0) {
      console.log(`Migración: ${enlazadas.affectedRows} sesiones enlazadas con su ponente ✅`);
    }
  } catch (err) {
    console.error('Migración: no se pudieron enlazar los ponentes ❌', err.message);
  }
};

const ejecutarMigraciones = async () => {
  // 1) Tablas faltantes
  for (const [tabla, sql] of Object.entries(TABLAS_ESPERADAS)) {
    try {
      const [antes] = await db.query(
        `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [tabla]
      );
      await db.query(sql);
      if (antes[0].n === 0) console.log(`Migración: tabla ${tabla} creada ✅`);
    } catch (err) {
      console.error(`Migración: no se pudo crear la tabla ${tabla} ❌`, err.message);
    }
  }

  // 2) Columnas faltantes
  for (const [tabla, columnas] of Object.entries(COLUMNAS_ESPERADAS)) {
    try {
      const [existentes] = await db.query(
        `SELECT COLUMN_NAME AS columna FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [tabla]
      );
      if (existentes.length === 0) continue; // la tabla aún no existe

      const yaEstan = existentes.map((c) => c.columna);
      for (const [columna, definicion] of Object.entries(columnas)) {
        if (yaEstan.includes(columna)) continue;
        // El nombre de tabla/columna proviene de esta constante interna,
        // no de la petición del usuario, por lo que es seguro interpolarlo.
        await db.query(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
        console.log(`Migración: columna ${tabla}.${columna} agregada ✅`);
      }
    } catch (err) {
      console.error(`Migración: no se pudo actualizar la tabla ${tabla} ❌`, err.message);
    }
  }

  // 3) Enlace inicial de la agenda con el catálogo de ponentes
  await enlazarPonentesUnaVez();
};

module.exports = ejecutarMigraciones;
