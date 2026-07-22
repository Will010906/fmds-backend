// ============================================================================
// Rutas del Boletín / Suscriptores  (montadas en /api/suscriptores)
// ----------------------------------------------------------------------------
// Suscribirse es público; ver la lista de suscriptores es solo para admin.
// ============================================================================
const express    = require('express');
const router     = express.Router();
const { crear, listar } = require('../controllers/suscriptorController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.post('/', crear);                              // POST /api/suscriptores -> suscribir un correo (público)
router.get('/',  verificarToken, soloAdmin, listar);  // GET  /api/suscriptores -> lista (solo admin)

module.exports = router;
