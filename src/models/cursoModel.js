const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM curso ORDER BY idCurso ASC');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM curso WHERE idCurso = ?', [id]);
  return rows[0];
};

const createCurso = async (datos) => {
  const { nombre, horas, nivel, precio, descripcion, badge } = datos;
  const [result] = await db.query(
    `INSERT INTO curso (nombre, horas, nivel, precio, descripcion, badge)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, horas, nivel, precio, descripcion, badge || null]
  );
  return result.insertId;
};

const update = async (id, datos) => {
  const { nombre, horas, nivel, precio, descripcion, badge } = datos;
  const [result] = await db.query(
    `UPDATE curso SET nombre=?, horas=?, nivel=?, precio=?, descripcion=?, badge=?
     WHERE idCurso=?`,
    [nombre, horas, nivel, precio, descripcion, badge || null, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await db.query('DELETE FROM curso WHERE idCurso = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, createCurso, update, remove };
