// ============================================================================
// Rutas de Speakers / Ponentes  (montadas en /api/speakers desde index.js)
// ----------------------------------------------------------------------------
// Lectura pública; crear/editar/eliminar solo para administradores.
// ============================================================================
const express    = require('express');
const router     = express.Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/speakerController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Públicas
router.get('/',    listar);   // GET /api/speakers
router.get('/:id', obtener);  // GET /api/speakers/:id

// Solo admin
router.post('/',      verificarToken, soloAdmin, crear);
router.put('/:id',    verificarToken, soloAdmin, actualizar);
router.delete('/:id', verificarToken, soloAdmin, eliminar);

module.exports = router;
