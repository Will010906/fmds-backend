const db = require('../config/db');

const findByCorreo = async (correo) => {
  const [rows] = await db.query(
    'SELECT * FROM usuario WHERE correo = ?',
    [correo]
  );
  return rows[0]; // undefined si no existe
};

const findById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM usuario WHERE idUsuario = ?',
    [id]
  );
  return rows[0];
};

const create = async (nombre, correo, hashedPassword, rol = 'Usuario General') => {
  const [result] = await db.query(
    'INSERT INTO usuario (nombre, correo, contrasenia, rol) VALUES (?, ?, ?, ?)',
    [nombre, correo, hashedPassword, rol]
  );
  return result.insertId;
};

const getAll = async () => {
  const [rows] = await db.query(
    'SELECT idUsuario, nombre, correo, rol FROM usuario ORDER BY idUsuario ASC'
  );
  return rows;
};

const updateRol = async (id, rol) => {
  const [result] = await db.query(
    'UPDATE usuario SET rol = ? WHERE idUsuario = ?',
    [rol, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await db.query('DELETE FROM usuario WHERE idUsuario = ?', [id]);
  return result.affectedRows;
};

module.exports = { findByCorreo, findById, create, getAll, updateRol, remove };