// ============================================================================
// Modelo de Mensaje de contacto (capa de acceso a datos)
// ----------------------------------------------------------------------------
// Guarda los mensajes que llegan del formulario público del sitio: consultas
// generales, propuestas de ponencia, envío de artículos e inscripciones al
// hackathon. El administrador los consulta desde el panel.
// ============================================================================
const db = require('../config/db');

// Registra un mensaje nuevo y devuelve el id generado.
const create = async ({ nombre, correo, asunto, mensaje }) => {
  const [result] = await db.query(
    `INSERT INTO mensaje (nombre, correo, asunto, mensaje)
     VALUES (?, ?, ?, ?)`,
    [nombre, correo, asunto, mensaje]
  );
  return result.insertId;
};

// Devuelve todos los mensajes, del más reciente al más antiguo.
const getAll = async () => {
  const [rows] = await db.query('SELECT * FROM mensaje ORDER BY creadoEn DESC');
  return rows;
};

// Elimina un mensaje ya atendido. Devuelve cuántas filas se borraron.
const remove = async (id) => {
  const [result] = await db.query('DELETE FROM mensaje WHERE idMensaje = ?', [id]);
  return result.affectedRows;
};

module.exports = { create, getAll, remove };
