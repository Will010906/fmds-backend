// ============================================================================
// Punto de entrada del servidor (API REST del backend FMDS)
// ----------------------------------------------------------------------------
// Configura Express, la seguridad (helmet, CORS, rate limit) y monta todas las
// rutas bajo /api/*. Al arrancar, verifica la conexión con MySQL y queda a la
// escucha en el puerto definido por la variable PORT (o 3000 en local).
// ============================================================================
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');       // Cabeceras de seguridad HTTP
const rateLimit  = require('express-rate-limit'); // Límite de intentos (anti fuerza bruta)
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const db         = require('./config/db');

const app = express();
app.set('trust proxy', 1); // Railway corre detrás de un proxy
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: false,
}))


app.use(express.json());

// Máximo 10 intentos de login por IP cada 15 minutos (contra fuerza bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera 15 minutos e intenta de nuevo.' },
});

// Rutas
app.use('/api/auth/login', loginLimiter);
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

const speakerRoutes = require('./routes/speakerRoutes');
app.use('/api/speakers', speakerRoutes);

const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

const suscriptorRoutes = require('./routes/suscriptorRoutes');
app.use('/api/suscriptores', suscriptorRoutes);

const sesionRoutes = require('./routes/sesionRoutes');
app.use('/api/sesiones', sesionRoutes);

const cursoRoutes = require('./routes/cursoRoutes');
app.use('/api/cursos', cursoRoutes);

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
