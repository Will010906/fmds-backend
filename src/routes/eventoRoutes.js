const express    = require('express');
const router     = express.Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/eventoController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// Públicas
router.get('/',    listar);
router.get('/:id', obtener);

// Solo admin
router.post('/',       verificarToken, soloAdmin, crear);
router.put('/:id',     verificarToken, soloAdmin, actualizar);
router.delete('/:id',  verificarToken, soloAdmin, eliminar);

module.exports = router;