const Sesion = require('../models/sesionModel');
const { createSesion } = Sesion;

const listar = async (req, res) => {
  try {
    const sesiones = await Sesion.getAll();
    res.json(sesiones);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener sesiones' });
  }
};

const obtener = async (req, res) => {
  try {
    const sesion = await Sesion.getById(req.params.id);
    if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' });
    res.json(sesion);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener sesión' });
  }
};

const crear = async (req, res) => {
  try {
    const id = await createSesion(req.body);
    res.status(201).json({ message: 'Sesión creada', id });
  } catch (err) {
    console.error('ERROR CREAR SESIÓN:', err);
    res.status(500).json({ error: 'Error al crear sesión' });
  }
};

const actualizar = async (req, res) => {
  try {
    const filas = await Sesion.update(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Sesión no encontrada' });
    res.json({ message: 'Sesión actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar sesión' });
  }
};

const eliminar = async (req, res) => {
  try {
    const filas = await Sesion.remove(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Sesión no encontrada' });
    res.json({ message: 'Sesión eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar sesión' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
