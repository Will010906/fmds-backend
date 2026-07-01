const express    = require('express');
const cors       = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const db         = require('./config/db');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Ping
app.get('/api/ping', (req, res) => {
  res.json({ message: 'FMDS API corriendo ✅' });
});

const { verificarToken, soloAdmin } = require('./middlewares/authMiddleware');

app.get('/api/perfil', verificarToken, (req, res) => {
  res.json({ message: 'Ruta protegida ✅', usuario: req.usuario });
});

const eventoRoutes = require('./routes/eventoRoutes');
// ...
app.use('/api/eventos', eventoRoutes);

const articuloRoutes = require('./routes/articuloRoutes');
app.use('/api/articulos', articuloRoutes);

const transaccionRoutes = require('./routes/transaccionRoutes');
app.use('/api/transacciones', transaccionRoutes);

const checkoutRoutes = require('./routes/checkoutRoutes');
app.use('/api/checkout', checkoutRoutes);

// Verificar MySQL
db.query('SELECT 1')
  .then(() => console.log('MySQL conectado ✅'))
  .catch(err => console.error('Error MySQL ❌', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
