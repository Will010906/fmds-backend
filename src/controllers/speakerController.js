const Speaker = require('../models/speakerModel');
const { createSpeaker } = Speaker;

const listar = async (req, res) => {
  try {
    const speakers = await Speaker.getAll();
    res.json(speakers);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener speakers' });
  }
};

const obtener = async (req, res) => {
  try {
    const speaker = await Speaker.getById(req.params.id);
    if (!speaker) return res.status(404).json({ error: 'Speaker no encontrado' });
    res.json(speaker);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener speaker' });
  }
};

const crear = async (req, res) => {
  try {
    const id = await createSpeaker(req.body);
    res.status(201).json({ message: 'Speaker creado', id });
  } catch (err) {
    console.error('ERROR CREAR SPEAKER:', err);
    res.status(500).json({ error: 'Error al crear speaker' });
  }
};

const actualizar = async (req, res) => {
  try {
    const filas = await Speaker.update(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Speaker no encontrado' });
    res.json({ message: 'Speaker actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar speaker' });
  }
};

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
