// ============================================================================
// Rutas de Autenticación  (montadas en /api/auth desde index.js)
// ----------------------------------------------------------------------------
// Ambas son públicas: es donde el usuario obtiene su sesión.
// El login tiene además un límite de intentos (rate limit) configurado en index.js.
// ============================================================================
const express    = require('express');
const router     = express.Router();
const { login, registro } = require('../controllers/authController');

router.post('/login',    login);     // POST /api/auth/login    -> devuelve token + usuario
router.post('/registro', registro);  // POST /api/auth/registro -> crea cuenta y devuelve token

module.exports = router;
