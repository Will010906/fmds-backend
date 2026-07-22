// ============================================================================
// Controlador de Checkout (cobro con Openpay)
// ----------------------------------------------------------------------------
// Recibe el token de la tarjeta que el frontend generó con Openpay (la tarjeta
// nunca pasa por este servidor) y ejecuta el cargo contra la API de Openpay con
// la llave privada. Soporta dos casos:
//   - Usuario con sesión: se cobra a su cuenta.
//   - Invitado (sin sesión): se crea/reutiliza una cuenta "invitada" por correo,
//     que luego puede reclamarse al registrarse con ese mismo correo.
// Si el cobro es exitoso, registra la transacción y descuenta el stock de boletos.
// La URL de Openpay (sandbox vs producción) sale de OPENPAY_BASE_URL.
// ============================================================================
const axios = require('axios');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Transaccion = require('../models/transaccionModel');
const Usuario = require('../models/usuarioModel');

const checkout = async (req, res) => {
  const { token_id, idEvento, cantidad, montoTotal, deviceSessionId, nombre, correo } = req.body;

  if (!token_id || !idEvento || !cantidad || !montoTotal) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    let usuario;

    if (req.usuario) {
      // Compra con sesión iniciada
      usuario = await Usuario.findById(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } else {
      // Compra como invitado: se liga a una cuenta invitada por correo
      if (!nombre || !correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        return res.status(400).json({ error: 'Nombre y correo válido son requeridos para comprar' });
      }
      usuario = await Usuario.findByCorreo(correo.toLowerCase().trim());
      if (!usuario) {
        const hash = await bcrypt.hash(crypto.randomUUID(), 10);
        const id = await Usuario.create(nombre.trim(), correo.toLowerCase().trim(), hash, 'Usuario General', 1);
        usuario = { idUsuario: id, nombre: nombre.trim(), correo: correo.toLowerCase().trim() };
      }
    }

    const merchantId = process.env.OPENPAY_MERCHANT_ID;
    const privateKey = process.env.OPENPAY_PRIVATE_KEY;
    // Para pasar a producción basta definir OPENPAY_BASE_URL=https://api.openpay.mx en el .env
    const baseUrl = process.env.OPENPAY_BASE_URL || 'https://sandbox-api.openpay.mx';
    const url = `${baseUrl}/v1/${merchantId}/charges`;

    const cargo = await axios.post(url, {
      source_id: token_id,
      method: 'card',
      amount: montoTotal,
      currency: 'MXN',
      description: `Boletos FMDS - Evento ${idEvento}`,
      device_session_id: deviceSessionId,
      customer: {
        name: usuario.nombre,
        email: usuario.correo,
      },
    }, {
      auth: {
        username: privateKey,
        password: '',
      },
    });

    const idTransaccion = await Transaccion.createTransaccion(
      usuario.idUsuario,
      montoTotal,
      [{ idEvento, cantidad }]
    );

    res.status(201).json({
      message: 'Pago exitoso',
      idTransaccion,
      openpay_id: cargo.data.id,
      status: cargo.data.status,
    });

  } catch (err) {
    console.error('ERROR CHECKOUT:', err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data?.description || 'Error al procesar el pago'
    });
  }
};

module.exports = { checkout };