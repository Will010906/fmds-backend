// ============================================================================
// Controlador de Speakers / Ponentes
// ----------------------------------------------------------------------------
// Mismo patrón CRUD que eventoController: listar/obtener son públicos y
// crear/actualizar/eliminar quedan restringidos a admin en las rutas.
// ============================================================================
const Speaker = require('../models/speakerModel');
const { createSpeaker } = Speaker;

// Devuelve todos los ponentes (destacados primero).
const listar = async (req, res) => {
  try {
    const speakers = await Speaker.getAll();
    res.json(speakers);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener speakers' });
  }
};

// Devuelve un ponente por id; 404 si no existe.
const obtener = async (req, res) => {
  try {
    const speaker = await Speaker.getById(req.params.id);
    if (!speaker) return res.status(404).json({ error: 'Speaker no encontrado' });
    res.json(speaker);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener speaker' });
  }
};

// Crea un ponente con los datos del cuerpo.
const crear = async (req, res) => {
  try {
    const id = await createSpeaker(req.body);
    res.status(201).json({ message: 'Speaker creado', id });
  } catch (err) {
    console.error('ERROR CREAR SPEAKER:', err);
    res.status(500).json({ error: 'Error al crear speaker' });
  }
};

// Actualiza un ponente; 404 si el id no existe.
const actualizar = async (req, res) => {
  try {
    const filas = await Speaker.update(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Speaker no encontrado' });
    res.json({ message: 'Speaker actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar speaker' });
  }
};

// Elimina un ponente; 404 si el id no existe.
const eliminar = async (req, res) => {
  try {
    const filas = await Speaker.remove(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Speaker no encontrado' });
    res.json({ message: 'Speaker eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar speaker' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
