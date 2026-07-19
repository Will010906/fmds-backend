const express    = require('express');
const router     = express.Router();
const { listar, obtener, crear, misCompras } = require('../controllers/transaccionController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

// La ruta fija va antes de /:id para que Express no la capture como id
router.get('/mias', verificarToken, misCompras);
router.get('/',    verificarToken, soloAdmin, listar);
router.get('/:id', verificarToken, soloAdmin, obtener);
router.post('/',   verificarToken, crear);

module.exports = router;