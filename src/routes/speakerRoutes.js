const express    = require('express');
const router     = express.Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/speakerController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/',    listar);
router.get('/:id', obtener);

router.post('/',      verificarToken, soloAdmin, crear);
router.put('/:id',    verificarToken, soloAdmin, actualizar);
router.delete('/:id', verificarToken, soloAdmin, eliminar);

module.exports = router;
