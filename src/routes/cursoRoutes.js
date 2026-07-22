// ============================================================================
// Rutas de Cursos  (montadas en /api/cursos desde index.js)
// ----------------------------------------------------------------------------
// Lectura pública; crear/editar/eliminar solo para administradores.
// ============================================================================
const express    = require('express');
const router     = express.Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/cursoController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Públicas
router.get('/',    listar);   // GET /api/cursos
router.get('/:id', obtener);  // GET /api/cursos/:id

// Solo admin
router.post('/',      verificarToken, soloAdmin, crear);
router.put('/:id',    verificarToken, soloAdmin, actualizar);
router.delete('/:id', verificarToken, soloAdmin, eliminar);

module.exports = router;
