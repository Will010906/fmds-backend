const express    = require('express');
const router     = express.Router();
const { listar, obtener, crear } = require('../controllers/transaccionController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/',    verificarToken, soloAdmin, listar);
router.get('/:id', verificarToken, soloAdmin, obtener);
router.post('/',   verificarToken, crear);

module.exports = router;