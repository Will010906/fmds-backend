// ============================================================================
// Controlador de Artículos
// ----------------------------------------------------------------------------
// Mismo patrón CRUD que eventoController: listar/obtener son públicos y
// crear/actualizar/eliminar quedan restringidos a admin en las rutas.
// ============================================================================
const Articulo = require('../models/articuloModel');
const { createArticulo } = Articulo;

// Devuelve todos los artículos.
const listar = async (req, res) => {
  try {
    const articulos = await Articulo.getAll();
    res.json(articulos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
};

// Devuelve un artículo por id; 404 si no existe.
const obtener = async (req, res) => {
  try {
    const articulo = await Articulo.getById(req.params.id);
    if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json(articulo);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener artículo' });
  }
};

// Crea un artículo con los datos del cuerpo.
const crear = async (req, res) => {
  try {
    const id = await createArticulo(req.body);
    res.status(201).json({ message: 'Artículo creado', id });
  } catch (err) {
    console.error('ERROR CREAR ARTÍCULO:', err);
    res.status(500).json({ error: 'Error al crear artículo' });
  }
};

// Actualiza un artículo; 404 si el id no existe.
const actualizar = async (req, res) => {
  try {
    const filas = await Articulo.update(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json({ message: 'Artículo actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar artículo' });
  }
};

// Elimina un artículo; 404 si el id no existe.
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
