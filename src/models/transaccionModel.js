const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query(`
    SELECT 
      t.idTransaccion,
      t.fechaPago,
      t.montoTotal,
      u.nombre AS usuario,
      u.correo
    FROM transaccion t
    JOIN usuario u ON t.idUsuario = u.idUsuario
    ORDER BY t.fechaPago DESC
  `);
  return rows;
};

const getById = async (id) => {
  const [transaccion] = await db.query(
    `SELECT t.*, u.nombre AS usuario, u.correo
     FROM transaccion t
     JOIN usuario u ON t.idUsuario = u.idUsuario
     WHERE t.idTransaccion = ?`,
    [id]
  );

  const [detalles] = await db.query(
    `SELECT dc.cantidad, dc.idEvento, e.titulo, e.precio
     FROM detalle_compra dc
     JOIN evento e ON dc.idEvento = e.idEvento
     WHERE dc.idTransaccion = ?`,
    [id]
  );

  return { ...transaccion[0], detalles };
};

const createTransaccion = async (idUsuario, montoTotal, detalles) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const idTransaccion = `TXN-${Date.now()}`;

    await conn.query(
      `INSERT INTO transaccion (idTransaccion, idUsuario, fechaPago, montoTotal)
       VALUES (?, ?, NOW(), ?)`,
      [idTransaccion, idUsuario, montoTotal]
    );

    for (const item of detalles) {
      await conn.query(
        `INSERT INTO detalle_compra (idTransaccion, idEvento, cantidad)
         VALUES (?, ?, ?)`,
        [idTransaccion, item.idEvento, item.cantidad]
      );

      await conn.query(
        `UPDATE evento SET stockBoletos = stockBoletos - ?
         WHERE idEvento = ? AND stockBoletos >= ?`,
        [item.cantidad, item.idEvento, item.cantidad]
      );
    }

    await conn.commit();
    return idTransaccion;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { getAll, getById, createTransaccion };