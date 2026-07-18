const Curso = require('../models/cursoModel');
const { createCurso } = Curso;

const listar = async (req, res) => {
  try {
    const cursos = await Curso.getAll();
    res.json(cursos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
};

const obtener = async (req, res) => {
  try {
    const curso = await Curso.getById(req.params.id);
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(curso);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener curso' });
  }
};

const crear = async (req, res) => {
  try {
    const id = await createCurso(req.body);
    res.status(201).json({ message: 'Curso creado', id });
  } catch (err) {
    console.error('ERROR CREAR CURSO:', err);
    res.status(500).json({ error: 'Error al crear curso' });
  }
};

const actualizar = async (req, res) => {
  try {
    const filas = await Curso.update(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json({ message: 'Curso actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar curso' });
  }
};

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
