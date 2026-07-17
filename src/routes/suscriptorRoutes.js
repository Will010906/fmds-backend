const express    = require('express');
const router     = express.Router();
const { crear, listar } = require('../controllers/suscriptorController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.post('/', crear);
router.get('/',  verificarToken, soloAdmin, listar);

module.exports = router;
