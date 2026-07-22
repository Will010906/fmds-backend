// ============================================================================
// Rutas de Usuarios  (montadas en /api/usuarios desde index.js)
// ----------------------------------------------------------------------------
// Todas son solo para administradores: es la gestión de usuarios del panel.
// ============================================================================
const express    = require('express');
const router     = express.Router();
const { listar, cambiarRol, eliminar } = require('../controllers/usuarioController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/',       verificarToken, soloAdmin, listar);      // GET    /api/usuarios     -> lista de usuarios
router.put('/:id',    verificarToken, soloAdmin, cambiarRol);  // PUT    /api/usuarios/:id -> cambiar rol
router.delete('/:id', verificarToken, soloAdmin, eliminar);    // DELETE /api/usuarios/:id -> eliminar usuario

module.exports = router;
