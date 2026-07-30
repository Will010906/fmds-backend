// ============================================================================
// Rutas de Mensajes de contacto  (montadas en /api/mensajes desde index.js)
// ----------------------------------------------------------------------------
// Enviar un mensaje es público; leerlos y eliminarlos es solo para admin.
// ============================================================================
const express    = require('express');
const router     = express.Router();
const { crear, listar, eliminar } = require('../controllers/mensajeController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.post('/',      crear);                                  // POST   /api/mensajes     -> enviar (público)
router.get('/',       verificarToken, soloAdmin, listar);      // GET    /api/mensajes     -> bandeja (admin)
router.delete('/:id', verificarToken, soloAdmin, eliminar);    // DELETE /api/mensajes/:id -> eliminar (admin)

module.exports = router;
