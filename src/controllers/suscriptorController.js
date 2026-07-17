const Suscriptor = require('../models/suscriptorModel');

const crear = async (req, res) => {
  const { correo } = req.body;

  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ error: 'Ingresa un correo válido' });
  }

  try {
    await Suscriptor.create(correo.toLowerCase().trim());
    res.status(201).json({ message: 'Suscripción registrada' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Este correo ya está suscrito' });
    }
    console.error('ERROR SUSCRIPTOR:', err);
    res.status(500).json({ error: 'Error al registrar la suscripción' });
  }
};

const listar = async (req, res) => {
  try {
    const suscriptores = await Suscriptor.getAll();
    res.json(suscriptores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener suscriptores' });
  }
};

module.exports = { crear, listar };
