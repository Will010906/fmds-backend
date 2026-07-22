// ============================================================================
// Modelo de Artículo (capa de acceso a datos)
// ----------------------------------------------------------------------------
// Contiene únicamente las consultas SQL a la tabla `articulo`. El controlador
// llama a estas funciones; así la lógica de negocio queda separada del SQL.
// Se usan consultas parametrizadas (?) para evitar inyección SQL.
// ============================================================================
const db = require('../config/db');

// Devuelve todos los artículos, del más reciente al más antiguo.
const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM articulo ORDER BY fechaPublicacion DESC');
  return rows;
};

// Devuelve un artículo por su id (o undefined si no existe).
const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM articulo WHERE idArticulo = ?', [id]);
  return rows[0];
};

// Inserta un artículo nuevo y devuelve el id generado.
const createArticulo = async (datos) => {
  const { titulo, cuerpo, autor, categoria, fechaPublicacion } = datos;
  const [result] = await db.query(
    `INSERT INTO articulo (titulo, cuerpo, autor, categoria, fechaPublicacion)
     VALUES (?, ?, ?, ?, ?)`,
    [titulo, cuerpo, autor, categoria, fechaPublicacion]
  );
  return result.insertId;
};

// Actualiza un artículo existente. Devuelve cuántas filas cambiaron (0 si el id no existe).
const update = async (id, datos) => {
  const { titulo, cuerpo, autor, categoria, fechaPublicacion } = datos;
  const [result] = await db.query(
    `UPDATE articulo SET titulo=?, cuerpo=?, autor=?, categoria=?, fechaPublicacion=?
     WHERE idArticulo=?`,
    [titulo, cuerpo, autor, categoria, fechaPublicacion, id]
  );
  return result.affectedRows;
};

// Elimina un artículo. Devuelve cuántas filas se borraron (0 si el id no existe).
const remove = async (id) => {
  const [result] = await db.query('DELETE FROM articulo WHERE idArticulo = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, createArticulo, update, remove };
