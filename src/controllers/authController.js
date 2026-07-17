const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const Usuario   = require('../models/usuarioModel');

const login = async (req, res) => {
  const { correo, contrasenia } = req.body;

  // 1. Validar campos vacíos
  if (!correo || !contrasenia) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    // 2. Buscar usuario en BD
    const usuario = await Usuario.findByCorreo(correo);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // 3. Comparar contraseña
    const passwordValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // 4. Generar JWT
    const token = jwt.sign(
      { id: usuario.idUsuario, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id:     usuario.idUsuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol:    usuario.rol,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const registro = async (req, res) => {
  const { nombre, correo, contrasenia, rol } = req.body;

  if (!nombre || !correo || !contrasenia) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    // Verificar si ya existe
    const existe = await Usuario.findByCorreo(correo);
    if (existe) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hashear contraseña
    const hash = await bcrypt.hash(contrasenia, 10);
    const id   = await Usuario.create(nombre, correo, hash, rol);

    // Generar JWT para dejarlo con sesión iniciada de inmediato
    const rolFinal = rol || 'Usuario General';
    const token = jwt.sign(
      { id, rol: rolFinal },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Usuario creado',
      token,
      usuario: { id, nombre, correo, rol: rolFinal },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { login, registro };