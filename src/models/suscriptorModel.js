// ============================================================================
// Modelo de Suscriptor del boletín (capa de acceso a datos)
// ----------------------------------------------------------------------------
// Consultas SQL a la tabla `suscriptor`. Guarda los correos que se registran
// en el boletín. La columna `correo` es UNIQUE, así que insertar un correo
// repetido lanza un error ER_DUP_ENTRY que el controlador traduce a "ya suscrito".
// ============================================================================
const db = require('../config/db');

// Inserta un correo nuevo en el boletín y devuelve el id generado.
const create = async (correo) => {
  const [result] = await db.query(
    'INSERT INTO suscriptor (correo) VALUES (?)',
    [correo]
  );
  return result.insertId;
};

// Devuelve todos los suscriptores, del más reciente al más antiguo (para el admin).
const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM suscriptor ORDER BY creadoEn DESC');
  return rows;
};

module.exports = { create, getAll };
