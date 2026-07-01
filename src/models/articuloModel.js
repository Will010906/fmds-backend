const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM articulo ORDER BY fechaPublicacion DESC');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM articulo WHERE idArticulo = ?', [id]);
  return rows[0];
};

const createArticulo = async (datos) => {
  const { titulo, cuerpo, autor, categoria, fechaPublicacion } = datos;
  const [result] = await db.query(
    `INSERT INTO articulo (titulo, cuerpo, autor, categoria, fechaPublicacion)
     VALUES (?, ?, ?, ?, ?)`,
    [titulo, cuerpo, autor, categoria, fechaPublicacion]
  );
  return result.insertId;
};

const update = async (id, datos) => {
  const { titulo, cuerpo, autor, categoria, fechaPublicacion } = datos;
  const [result] = await db.query(
    `UPDATE articulo SET titulo=?, cuerpo=?, autor=?, categoria=?, fechaPublicacion=?
     WHERE idArticulo=?`,
    [titulo, cuerpo, autor, categoria, fechaPublicacion, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await db.query('DELETE FROM articulo WHERE idArticulo = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, createArticulo, update, remove };