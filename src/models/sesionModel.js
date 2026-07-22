// ============================================================================
// Modelo de Sesión / Agenda (capa de acceso a datos)
// ----------------------------------------------------------------------------
// Consultas SQL a la tabla `sesion`. Cada sesión es una actividad de la agenda
// del congreso, ubicada por `dia` (1, 2, 3...) y `hora`.
// ============================================================================
const db = require('../config/db');

// Devuelve todas las sesiones ordenadas por día y hora (orden cronológico).
const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM sesion ORDER BY dia ASC, hora ASC');
  return rows;
};

// Devuelve una sesión por su id (o undefined si no existe).
const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM sesion WHERE idSesion = ?', [id]);
  return rows[0];
};

// Inserta una sesión nueva y devuelve el id generado.
const createSesion = async (datos) => {
  const { dia, hora, duracion, tipo, nombre, ponente, badge } = datos;
  const [result] = await db.query(
    `INSERT INTO sesion (dia, hora, duracion, tipo, nombre, ponente, badge)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    // El badge define el color en la agenda; "Keynote" es el valor por defecto.
    [dia, hora, duracion, tipo, nombre, ponente, badge || 'Keynote']
  );
  return result.insertId;
};

// Actualiza una sesión existente. Devuelve cuántas filas cambiaron.
const update = async (id, datos) => {
  const { dia, hora, duracion, tipo, nombre, ponente, badge } = datos;
  const [result] = await db.query(
    `UPDATE sesion SET dia=?, hora=?, duracion=?, tipo=?, nombre=?, ponente=?, badge=?
     WHERE idSesion=?`,
    [dia, hora, duracion, tipo, nombre, ponente, badge || 'Keynote', id]
  );
  return result.affectedRows;
};

// Elimina una sesión. Devuelve cuántas filas se borraron.
const remove = async (id) => {
  const [result] = await db.query('DELETE FROM sesion WHERE idSesion = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, createSesion, update, remove };
