// ============================================================================
// Controlador de Mensajes de contacto
// ----------------------------------------------------------------------------
// `crear` es público (cualquier visitante escribe desde el formulario del
// sitio); `listar` y `eliminar` son solo para administradores (ver rutas).
// ============================================================================
const Mensaje = require('../models/mensajeModel');

// Asuntos permitidos: coinciden con las opciones del formulario del sitio.
const ASUNTOS_VALIDOS = [
  'Consulta general',
  'Propuesta de ponencia',
  'Alianzas y patrocinios',
];

// Registra un mensaje enviado desde el formulario público.
const crear = async (req, res) => {
  const { nombre, correo, asunto, mensaje } = req.body;

  if (!nombre?.trim() || !mensaje?.trim()) {
    return res.status(400).json({ error: 'Nombre y mensaje son requeridos' });
  }
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ error: 'Ingresa un correo válido' });
  }
  // Si llega un asunto desconocido se guarda como consulta general.
  const asuntoFinal = ASUNTOS_VALIDOS.includes(asunto) ? asunto : 'Consulta general';

  try {
    await Mensaje.create({
      nombre: nombre.trim(),
      correo: correo.toLowerCase().trim(),
      asunto: asuntoFinal,
      mensaje: mensaje.trim(),
    });
    res.status(201).json({ message: 'Mensaje enviado' });
  } catch (err) {
    console.error('ERROR MENSAJE:', err);
    res.status(500).json({ error: 'No pudimos enviar tu mensaje, intenta de nuevo' });
  }
};

// Devuelve todos los mensajes recibidos (solo admin).
const listar = async (req, res) => {
  try {
    const mensajes = await Mensaje.getAll();
    res.json(mensajes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

// Elimina un mensaje ya atendido (solo admin).
const eliminar = async (req, res) => {
  try {
    const filas = await Mensaje.remove(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json({ message: 'Mensaje eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar mensaje' });
  }
};

module.exports = { crear, listar, eliminar };
