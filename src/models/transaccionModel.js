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

const getByUsuario = async (idUsuario) => {
  const [rows] = await db.query(
    `SELECT t.idTransaccion, t.fechaPago, t.montoTotal,
            dc.cantidad, e.titulo, e.fecha AS fechaEvento
     FROM transaccion t
     JOIN detalle_compra dc ON dc.idTransaccion = t.idTransaccion
     JOIN evento e ON e.idEvento = dc.idEvento
     WHERE t.idUsuario = ?
     ORDER BY t.fechaPago DESC`,
    [idUsuario]
  );

  // Una transacción puede tener varios eventos: se agrupan por folio
  const porFolio = new Map();
  for (const fila of rows) {
    if (!porFolio.has(fila.idTransaccion)) {
      porFolio.set(fila.idTransaccion, {
        idTransaccion: fila.idTransaccion,
        fechaPago: fila.fechaPago,
        montoTotal: fila.montoTotal,
        detalles: [],
      });
    }
    porFolio.get(fila.idTransaccion).detalles.push({
      titulo: fila.titulo,
      fechaEvento: fila.fechaEvento,
      cantidad: fila.cantidad,
    });
  }
  return [...porFolio.values()];
};

// Registra la venta y descuenta el inventario dentro de una sola transacción
// de base de datos: o quedan las dos cosas, o no queda ninguna.
// `folio` es opcional; el checkout lo manda para que el id de la transacción
// sea el mismo que el order_id enviado a Openpay y ambas puedan conciliarse.
const createTransaccion = async (idUsuario, montoTotal, detalles, folio) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const idTransaccion = folio || `TXN-${Date.now()}`;

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

      const [descuento] = await conn.query(
        `UPDATE evento SET stockBoletos = stockBoletos - ?
         WHERE idEvento = ? AND stockBoletos >= ?`,
        [item.cantidad, item.idEvento, item.cantidad]
      );

      // Cuando ya no hay boletos suficientes, la condición del WHERE no se
      // cumple: MySQL no lanza ningún error, simplemente no toca ninguna fila.
      // Sin esta comprobación la venta se guardaría igual y se venderían
      // boletos que no existen.
      if (descuento.affectedRows === 0) {
        const err = new Error(`Sin inventario suficiente en el evento ${item.idEvento}`);
        err.codigo = 'SIN_STOCK';
        throw err;
      }
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

module.exports = { getAll, getById, getByUsuario, createTransaccion };