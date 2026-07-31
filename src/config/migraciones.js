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
};

module.exports = ejecutarMigraciones;
