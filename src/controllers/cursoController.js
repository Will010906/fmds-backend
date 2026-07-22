// ============================================================================
// Controlador de Cursos
// ----------------------------------------------------------------------------
// Mismo patrón CRUD que eventoController: listar/obtener son públicos y
// crear/actualizar/eliminar quedan restringidos a admin en las rutas.
// ============================================================================
const Curso = require('../models/cursoModel');
const { createCurso } = Curso;

// Devuelve todos los cursos.
const listar = async (req, res) => {
  try {
    const cursos = await Curso.getAll();
    res.json(cursos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
};

// Devuelve un curso por id; 404 si no existe.
const obtener = async (req, res) => {
  try {
    const curso = await Curso.getById(req.params.id);
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(curso);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener curso' });
  }
};

// Crea un curso con los datos del cuerpo.
const crear = async (req, res) => {
  try {
    const id = await createCurso(req.body);
    res.status(201).json({ message: 'Curso creado', id });
  } catch (err) {
    console.error('ERROR CREAR CURSO:', err);
    res.status(500).json({ error: 'Error al crear curso' });
  }
};

// Actualiza un curso; 404 si el id no existe.
const actualizar = async (req, res) => {
  try {
    const filas = await Curso.update(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json({ message: 'Curso actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar curso' });
  }
};

// Elimina un curso; 404 si el id no existe.
const eliminar = async (req, res) => {
  try {
    const filas = await Curso.remove(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json({ message: 'Curso eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar curso' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
