// ============================================================================
// Rutas de Paquetes  (montadas en /api/paquetes desde index.js)
// ----------------------------------------------------------------------------
// Lectura pública; crear/editar/eliminar solo para administradores.
// GET /api/paquetes?idEvento=N devuelve únicamente los paquetes activos de ese
// evento, que es lo que consume la página de registro.
// ============================================================================
const express = require('express');
const router  = express.Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/paqueteController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Públicas
router.get('/',    listar);   // GET /api/paquetes  ·  GET /api/paquetes?idEvento=1
router.get('/:id', obtener);  // GET /api/paquetes/:id

// Solo admin
router.post('/',      verificarToken, soloAdmin, crear);
router.put('/:id',    verificarToken, soloAdmin, actualizar);
router.delete('/:id', verificarToken, soloAdmin, eliminar);

module.exports = router;
