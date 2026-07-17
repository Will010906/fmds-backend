const db = require('../config/db');

const create = async (correo) => {
  const [result] = await db.query(
    'INSERT INTO suscriptor (correo) VALUES (?)',
    [correo]
  );
  return result.insertId;
};

const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM suscriptor ORDER BY creadoEn DESC');
  return rows;
};

module.exports = { create, getAll };
