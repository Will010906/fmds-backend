const Articulo = require('../models/articuloModel');
const { createArticulo } = Articulo;

const listar = async (req, res) => {
  try {
    const articulos = await Articulo.getAll();
    res.json(articulos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
};

const obtener = async (req, res) => {
  try {
    const articulo = await Articulo.getById(req.params.id);
    if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json(articulo);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener artículo' });
  }
};

const crear = async (req, res) => {
  try {
    const id = await createArticulo(req.body);
    res.status(201).json({ message: 'Artículo creado', id });
  } catch (err) {
    console.error('ERROR CREAR ARTÍCULO:', err);
    res.status(500).json({ error: 'Error al crear artículo' });
  }
};

const actualizar = async (req, res) => {
  try {
    const filas = await Articulo.update(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json({ message: 'Artículo actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar artículo' });
  }
};

const eliminar = async (req, res) => {
  try {
    const filas = await Articulo.remove(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json({ message: 'Artículo eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar artículo' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };