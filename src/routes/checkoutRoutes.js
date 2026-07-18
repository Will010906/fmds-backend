const express  = require('express');
const router   = express.Router();
const { checkout } = require('../controllers/checkoutController');
const { tokenOpcional } = require('../middlewares/authMiddleware');

// tokenOpcional: con sesión usa la cuenta del usuario; sin sesión
// compra como invitado (requiere nombre y correo en el body)
router.post('/', tokenOpcional, checkout);

module.exports = router;