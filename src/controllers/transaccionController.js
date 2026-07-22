// ============================================================================
// Controlador de Transacciones (compras / boletos)
// ----------------------------------------------------------------------------
// Una transacción es un pago registrado. El cobro real lo hace checkoutController
// (con Openpay); aquí se consultan las transacciones ya guardadas.
//   listar / obtener -> solo admin (ver todas las ventas)
//   misCompras       -> el usuario autenticado ve sus propios boletos
//   crear            -> registro manual de una transacción (usuario autenticado)
// ============================================================================
const Transaccion = require('../models/transaccionModel');

// Devuelve todas las transacciones del sistema (solo admin, pestaña Ventas).
const listar = async (req, res) => {
  try {
    const transacciones = await Transaccion.getAll();
    res.json(transacciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
};

// Devuelve una transacción por id con su detalle (solo admin).
const obtener = async (req, res) => {
  try {
    const transaccion = await Transaccion.getById(req.params.id);
    if (!transaccion) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.json(transaccion);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener transacción' });
  }
};

// Devuelve las compras del usuario autenticado (página "Mis boletos").
// req.usuario.id lo coloca el middleware verificarToken a partir del JWT.
const misCompras = async (req, res) => {
  try {
    const compras = await Transaccion.getByUsuario(req.usuario.id);
    res.json(compras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tus boletos' });
  }
};

// Registra una transacción para el usuario autenticado.
// `detalles` es un arreglo de { idEvento, cantidad }.
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

module.exports = { listar, obtener, crear, misCompras };
