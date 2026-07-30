// ============================================================================
// Modelo de Evento (capa de acceso a datos)
// ----------------------------------------------------------------------------
// Consultas SQL a la tabla `evento`. Cada evento tiene un stock de boletos
// (`stockBoletos`) que se descuenta al comprar (ver transaccionModel).
// ============================================================================
const db = require('../config/db');

// Devuelve todos los eventos ordenados por fecha (el más próximo primero).
const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM evento ORDER BY fecha ASC');
  return rows;
};

// Devuelve un evento por su id (o undefined si no existe).
const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM evento WHERE idEvento = ?', [id]);
  return rows[0];
};

// Los campos descriptivos son opcionales: si no vienen se guardan como null
// (o con la modalidad por defecto) para no romper los eventos ya registrados.
const normalizar = (datos) => ({
  descripcion: datos.descripcion?.trim() || null,
  sede:        datos.sede?.trim() || null,
  ciudad:      datos.ciudad?.trim() || null,
  hora:        datos.hora || null,
  modalidad:   datos.modalidad || 'Presencial',
});

// Inserta un evento nuevo y devuelve el id generado.
const createEvento = async (datos) => {
  const { titulo, fecha, precio, stockBoletos } = datos;
  const d = normalizar(datos);
  const [result] = await db.query(
    `INSERT INTO evento (titulo, fecha, precio, stockBoletos, descripcion, sede, ciudad, hora, modalidad)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [titulo, fecha, precio, stockBoletos, d.descripcion, d.sede, d.ciudad, d.hora, d.modalidad]
  );
  return result.insertId;
};

// Actualiza un evento existente. Devuelve cuántas filas cambiaron.
const update = async (id, datos) => {
  const { titulo, fecha, precio, stockBoletos } = datos;
  const d = normalizar(datos);
  const [result] = await db.query(
    `UPDATE evento SET titulo=?, fecha=?, precio=?, stockBoletos=?,
            descripcion=?, sede=?, ciudad=?, hora=?, modalidad=?
     WHERE idEvento=?`,
    [titulo, fecha, precio, stockBoletos, d.descripcion, d.sede, d.ciudad, d.hora, d.modalidad, id]
  );
  return result.affectedRows;
};

// Elimina un evento. Devuelve cuántas filas se borraron.
const remove = async (id) => {
  const [result] = await db.query('DELETE FROM evento WHERE idEvento = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getById, createEvento, update, remove };
