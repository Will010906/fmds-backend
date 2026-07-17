const express    = require('express');
const router     = express.Router();
const { listar, cambiarRol, eliminar } = require('../controllers/usuarioController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/',       verificarToken, soloAdmin, listar);
router.put('/:id',    verificarToken, soloAdmin, cambiarRol);
router.delete('/:id', verificarToken, soloAdmin, eliminar);

module.exports = router;
