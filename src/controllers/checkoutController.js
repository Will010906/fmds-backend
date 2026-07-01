const axios = require('axios');
const Transaccion = require('../models/transaccionModel');

const checkout = async (req, res) => {
  const { token_id, idEvento, cantidad, montoTotal, deviceSessionId } = req.body;
  const idUsuario = req.usuario.id;

  if (!token_id || !idEvento || !cantidad || !montoTotal) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const merchantId = process.env.OPENPAY_MERCHANT_ID;
    const privateKey = process.env.OPENPAY_PRIVATE_KEY;
    const url = `https://sandbox-api.openpay.mx/v1/${merchantId}/charges`;

    const cargo = await axios.post(url, {
      source_id: token_id,
      method: 'card',
      amount: montoTotal,
      currency: 'MXN',
      description: `Boletos FMDS - Evento ${idEvento}`,
      device_session_id: deviceSessionId,
      customer: {
        name: 'Usuario FMDS',
        email: 'usuario@fmds.mx',
      },
    }, {
      auth: {
        username: privateKey,
        password: '',
      },
    });

    const idTransaccion = await Transaccion.createTransaccion(
      idUsuario,
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