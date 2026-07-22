// ============================================================================
// Controlador de Suscriptores del boletín
// ----------------------------------------------------------------------------
// `crear` es público (cualquiera se suscribe desde el sitio); `listar` es solo
// para el admin (ver rutas). Valida el formato del correo antes de guardarlo.
// ============================================================================
const Suscriptor = require('../models/suscriptorModel');

// Registra un correo en el boletín (endpoint público).
const crear = async (req, res) => {
  const { correo } = req.body;

  // Validación básica de formato de correo con expresión regular.
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ error: 'Ingresa un correo válido' });
  }

  try {
    // Se normaliza a minúsculas y sin espacios para evitar duplicados por formato.
    await Suscriptor.create(correo.toLowerCase().trim());
    res.status(201).json({ message: 'Suscripción registrada' });
  } catch (err) {
    // La columna `correo` es UNIQUE: si ya existe, MySQL lanza ER_DUP_ENTRY.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Este correo ya está suscrito' });
    }
    console.error('ERROR SUSCRIPTOR:', err);
    res.status(500).json({ error: 'Error al registrar la suscripción' });
  }
};

// Devuelve todos los suscriptores (solo admin).
const listar = async (req, res) => {
  try {
    const suscriptores = await Suscriptor.getAll();
    res.json(suscriptores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener suscriptores' });
  }
};

module.exports = { crear, listar };
