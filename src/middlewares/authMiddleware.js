// ============================================================================
// Middlewares de autenticación y autorización
// ----------------------------------------------------------------------------
// Se ejecutan ANTES del controlador en las rutas protegidas:
//   verificarToken -> exige un JWT válido; si lo es, deja los datos del usuario
//                     en req.usuario para que el controlador los use.
//   soloAdmin      -> se usa después de verificarToken; exige rol Administrador.
//   tokenOpcional  -> intenta identificar al usuario pero no bloquea si no hay
//                     token (para el checkout, que acepta invitados).
// El JWT se envía en la cabecera:  Authorization: Bearer <token>
// ============================================================================
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, rol }
    next();
  } catch (err) {
    // 401 = sesión no válida (el frontend cierra sesión); 403 se reserva para falta de rol
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
};

// Adjunta req.usuario si hay token válido, pero no rechaza si falta
// (para rutas que aceptan tanto usuarios con sesión como invitados).
const tokenOpcional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // token inválido o expirado: se continúa como invitado
    }
  }
  next();
};

module.exports = { verificarToken, soloAdmin, tokenOpcional };