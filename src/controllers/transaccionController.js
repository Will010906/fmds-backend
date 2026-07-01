const Transaccion = require('../models/transaccionModel');

const listar = async (req, res) => {
  try {
    const transacciones = await Transaccion.getAll();
    res.json(transacciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
};

const obtener = async (req, res) => {
  try {
    const transaccion = await Transaccion.getById(req.params.id);
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.json(transaccion);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener transacción' });
  }
};

const crear = async (req, res) => {
  const { montoTotal, detalles } = req.body;
  const idUsuario = req.usuario.id;

  if (!montoTotal || !detalles || !detalles.length) {
    return res.status(400).json({ error: 'montoTotal y detalles son requeridos' });
  }

  try {
    const idTransaccion = await Transaccion.createTransaccion(idUsuario, montoTotal, detalles);
    res.status(201).json({ message: 'Transacción creada', idTransaccion });
  } catch (err) {
    console.error('ERROR CREAR TRANSACCIÓN:', err);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
};

module.exports = { listar, obtener, crear };