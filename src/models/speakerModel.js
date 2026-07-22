// ============================================================================
// Modelo de Speaker / Ponente (capa de acceso a datos)
// ----------------------------------------------------------------------------
// Consultas SQL a la tabla `speaker`. Un ponente puede estar marcado como
// `featured` (destacado) para mostrarlo como keynote principal en el sitio.
// ============================================================================
const db = require('../config/db');

// Devuelve todos los ponentes: primero los destacados (featured = 1), luego por id.
const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM speaker ORDER BY featured DESC, idSpeaker ASC');
  return rows;
};

// Devuelve un ponente por su id (o undefined si no existe).
const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM speaker WHERE idSpeaker = ?', [id]);
  return rows[0];
};

// Inserta un ponente nuevo y devuelve el id generado.
const createSpeaker = async (datos) => {
  const { nombre, rol, area, tema, frase, featured, fotoUrl } = datos;
  const [result] = await db.query(
    `INSERT INTO speaker (nombre, rol, area, tema, frase, featured, fotoUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    // frase y fotoUrl son opcionales -> null si no vienen. featured se guarda
    // como 1/0 porque en MySQL es un TINYINT (booleano).
    [nombre, rol, area, tema, frase || null, featured ? 1 : 0, fotoUrl || null]
  );
  return result.insertId;
};

// Actualiza un ponente existente. Devuelve cuántas filas cambiaron.
const update = async (id, datos) => {
  const { nombre, rol, area, tema, frase, featured, fotoUrl } = datos;
  const [result] = await db.query(
    `UPDATE speaker SET nombre=?, rol=?, area=?, tema=?, frase=?, featured=?, fotoUrl=?
     WHERE idSpeaker=?`,
    [nombre, rol, area, tema, frase || null, featured ? 1 : 0, fotoUrl || null, id]
  );
  return result.affectedRows;
};

// Elimina un ponente. Devuelve cuántas filas se borraron.
const remove = async (id) => {
  const [result] = await db.query('DELETE FROM speaker WHERE idSpeaker = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, createSpeaker, update, remove };
