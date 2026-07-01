const express  = require('express');
const router   = express.Router();
const { checkout } = require('../controllers/checkoutController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, checkout);

module.exports = router;