const Evento = require('../models/eventoModel');
const { createEvento } = Evento;

const listar = async (req, res) => {
  try {
    const eventos = await Evento.getAll();
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};

const obtener = async (req, res) => {
  try {
    const evento = await Evento.getById(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener evento' });
  }
};

const crear = async (req, res) => {
  try {
    const id = await createEvento(req.body);
    res.status(201).json({ message: 'Evento creado', id });
  } catch (err) {
    console.error('ERROR CREAR EVENTO:', err);
    res.status(500).json({ error: 'Error al crear evento' });
  }
};

const actualizar = async (req, res) => {
  try {
    const filas = await Evento.update(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ message: 'Evento actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
};

const eliminar = async (req, res) => {
  try {
    const filas = await Evento.remove(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };