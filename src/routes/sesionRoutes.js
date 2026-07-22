// ============================================================================
// Rutas de Sesiones / Agenda  (montadas en /api/sesiones desde index.js)
// ----------------------------------------------------------------------------
// Lectura pública; crear/editar/eliminar solo para administradores.
// ============================================================================
const express    = require('express');
const router     = express.Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/sesionController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Públicas
router.get('/',    listar);   // GET /api/sesiones
router.get('/:id', obtener);  // GET /api/sesiones/:id

// Solo admin
router.post('/',      verificarToken, soloAdmin, crear);
router.put('/:id',    verificarToken, soloAdmin, actualizar);
router.delete('/:id', verificarToken, soloAdmin, eliminar);

module.exports = router;
