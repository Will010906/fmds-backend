const db = require('../config/db');

const findByCorreo = async (correo) => {
  const [rows] = await db.query(
    'SELECT * FROM usuario WHERE correo = ?',
    [correo]
  );
  return rows[0]; // undefined si no existe
};

const create = async (nombre, correo, hashedPassword, rol = 'Usuario General') => {
  const [result] = await db.query(
    'INSERT INTO usuario (nombre, correo, contrasenia, rol) VALUES (?, ?, ?, ?)',
    [nombre, correo, hashedPassword, rol]
  );
  return result.insertId;
};

module.exports = { findByCorreo, create };