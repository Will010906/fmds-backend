// ============================================================================
// Rutas de Eventos  (montadas en /api/eventos desde index.js)
// ----------------------------------------------------------------------------
// Define qué función del controlador atiende cada método+ruta y qué middleware
// de seguridad se aplica:
//   verificarToken -> exige un JWT válido (usuario autenticado)
//   soloAdmin      -> además exige rol Administrador
// La lectura es pública; crear/editar/eliminar es solo para administradores.
// ============================================================================
const express    = require('express');
const router     = express.Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/eventoController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Públicas (cualquier visitante)
router.get('/',    listar);   // GET  /api/eventos      -> lista de eventos
router.get('/:id', obtener);  // GET  /api/eventos/:id  -> un evento

// Solo admin
router.post('/',       verificarToken, soloAdmin, crear);       // POST   /api/eventos
router.put('/:id',     verificarToken, soloAdmin, actualizar);  // PUT    /api/eventos/:id
router.delete('/:id',  verificarToken, soloAdmin, eliminar);    // DELETE /api/eventos/:id

module.exports = router;
