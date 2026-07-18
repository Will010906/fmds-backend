const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM sesion ORDER BY dia ASC, hora ASC');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM sesion WHERE idSesion = ?', [id]);
  return rows[0];
};

const createSesion = async (datos) => {
  const { dia, hora, duracion, tipo, nombre, ponente, badge } = datos;
  const [result] = await db.query(
    `INSERT INTO sesion (dia, hora, duracion, tipo, nombre, ponente, badge)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [dia, hora, duracion, tipo, nombre, ponente, badge || 'Keynote']
  );
  return result.insertId;
};

const update = async (id, datos) => {
  const { dia, hora, duracion, tipo, nombre, ponente, badge } = datos;
  const [result] = await db.query(
    `UPDATE sesion SET dia=?, hora=?, duracion=?, tipo=?, nombre=?, ponente=?, badge=?
     WHERE idSesion=?`,
    [dia, hora, duracion, tipo, nombre, ponente, badge || 'Keynote', id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await db.query('DELETE FROM sesion WHERE idSesion = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, createSesion, update, remove };
