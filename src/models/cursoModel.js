// ============================================================================
// Modelo de Curso (capa de acceso a datos)
// ----------------------------------------------------------------------------
// Consultas SQL a la tabla `curso`. Los cursos son la oferta de formación en
// línea que se muestra en la página /cursos.
// ============================================================================
const db = require('../config/db');

// Devuelve todos los cursos en su orden de creación.
const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM curso ORDER BY idCurso ASC');
  return rows;
};

// Devuelve un curso por su id (o undefined si no existe).
const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM curso WHERE idCurso = ?', [id]);
  return rows[0];
};

// Inserta un curso nuevo y devuelve el id generado.
const createCurso = async (datos) => {
  const { nombre, horas, nivel, precio, descripcion, badge } = datos;
  const [result] = await db.query(
    `INSERT INTO curso (nombre, horas, nivel, precio, descripcion, badge)
     VALUES (?, ?, ?, ?, ?, ?)`,
    // badge (ej. "Popular") es opcional -> null si no viene.
    [nombre, horas, nivel, precio, descripcion, badge || null]
  );
  return result.insertId;
};

// Actualiza un curso existente. Devuelve cuántas filas cambiaron.
const update = async (id, datos) => {
  const { nombre, horas, nivel, precio, descripcion, badge } = datos;
  const [result] = await db.query(
    `UPDATE curso SET nombre=?, horas=?, nivel=?, precio=?, descripcion=?, badge=?
     WHERE idCurso=?`,
    [nombre, horas, nivel, precio, descripcion, badge || null, id]
  );
  return result.affectedRows;
};

// Elimina un curso. Devuelve cuántas filas se borraron.
const remove = async (id) => {
  const [result] = await db.query('DELETE FROM curso WHERE idCurso = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, createCurso, update, remove };
