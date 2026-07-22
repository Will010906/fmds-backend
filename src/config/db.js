// ============================================================================
// Conexión a la base de datos MySQL
// ----------------------------------------------------------------------------
// Crea un "pool" de conexiones: en lugar de abrir y cerrar una conexión por
// cada consulta, mantiene un conjunto de conexiones reutilizables. Es más
// eficiente cuando llegan varias peticiones al mismo tiempo.
// ============================================================================
const mysql = require('mysql2');
require('dotenv').config(); // Carga las credenciales desde el archivo .env

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 3306, // 3306 es el puerto por defecto de MySQL
});

// .promise() habilita el uso de async/await en las consultas (en vez de callbacks).
const db = pool.promise();
module.exports = db;
