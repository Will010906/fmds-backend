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

const create = async (nombre, correo, hashedPassword, rol = 'Usuario General', esInvitado = 0) => {
  const [result] = await db.query(
    'INSERT INTO usuario (nombre, correo, contrasenia, rol, esInvitado) VALUES (?, ?, ?, ?, ?)',
    [nombre, correo, hashedPassword, rol, esInvitado]
  );
  return result.insertId;
};

// Convierte una cuenta invitada (creada al comprar sin registro) en
// cuenta completa cuando la persona se registra con el mismo correo.
const convertirInvitado = async (id, nombre, hashedPassword) => {
  const [result] = await db.query(
    'UPDATE usuario SET nombre = ?, contrasenia = ?, esInvitado = 0 WHERE idUsuario = ?',
    [nombre, hashedPassword, id]
  );
  return result.affectedRows;
};

const getAll = async () => {
  const [rows] = await db.query(
    'SELECT idUsuario, nombre, correo, rol, esInvitado FROM usuario ORDER BY idUsuario ASC'
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

module.exports = { findByCorreo, findById, create, convertirInvitado, getAll, updateRol, remove };