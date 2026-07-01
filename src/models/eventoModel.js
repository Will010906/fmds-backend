const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM evento ORDER BY fecha ASC');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM evento WHERE idEvento = ?', [id]);
  return rows[0];
};

const createEvento = async (datos) => {
  const { titulo, fecha, precio, stockBoletos } = datos;
  const [result] = await db.query(
    `INSERT INTO evento (titulo, fecha, precio, stockBoletos)
     VALUES (?, ?, ?, ?)`,
    [titulo, fecha, precio, stockBoletos]
  );
  return result.insertId;
};

const update = async (id, datos) => {
  const { titulo, fecha, precio, stockBoletos } = datos;
  const [result] = await db.query(
    `UPDATE evento SET titulo=?, fecha=?, precio=?, stockBoletos=?
     WHERE idEvento=?`,
    [titulo, fecha, precio, stockBoletos, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await db.query('DELETE FROM evento WHERE idEvento = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, createEvento, update, remove };