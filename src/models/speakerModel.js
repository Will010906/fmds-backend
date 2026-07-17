const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM speaker ORDER BY featured DESC, idSpeaker ASC');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM speaker WHERE idSpeaker = ?', [id]);
  return rows[0];
};

const createSpeaker = async (datos) => {
  const { nombre, rol, area, tema, frase, featured, fotoUrl } = datos;
  const [result] = await db.query(
    `INSERT INTO speaker (nombre, rol, area, tema, frase, featured, fotoUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombre, rol, area, tema, frase || null, featured ? 1 : 0, fotoUrl || null]
  );
  return result.insertId;
};

const update = async (id, datos) => {
  const { nombre, rol, area, tema, frase, featured, fotoUrl } = datos;
  const [result] = await db.query(
    `UPDATE speaker SET nombre=?, rol=?, area=?, tema=?, frase=?, featured=?, fotoUrl=?
     WHERE idSpeaker=?`,
    [nombre, rol, area, tema, frase || null, featured ? 1 : 0, fotoUrl || null, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await db.query('DELETE FROM speaker WHERE idSpeaker = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, createSpeaker, update, remove };
