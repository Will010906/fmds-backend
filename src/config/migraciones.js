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
const TABLAS_ESPERADAS = {
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
const COLUMNAS_ESPERADAS = {
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
  sesion: {
    idEvento:  'INT NULL',
    idSpeaker: 'INT NULL',
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

    const [enlazadas] = await db.query(`
      UPDATE sesion s
      JOIN speaker sp ON s.ponente LIKE CONCAT('%', sp.nombre, '%')
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
