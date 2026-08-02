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

// 1. Configuración de CORS permitiendo preflight explícito
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Responde a las peticiones OPTIONS preflight de inmediato

// 2. Helmet con políticas relajadas para cross-origin
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));

app.use(express.json());

// 3. Rate Limiting ignorando peticiones OPTIONS
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Salta el limitador si es preflight
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

const mensajeRoutes = require('./routes/mensajeRoutes');
app.use('/api/mensajes', mensajeRoutes);

const paqueteRoutes = require('./routes/paqueteRoutes');
app.use('/api/paquetes', paqueteRoutes);

// Verificar MySQL y, si la conexión funciona, poner al día el esquema
const ejecutarMigraciones = require('./config/migraciones');
db.query('SELECT 1')
  .then(() => {
    console.log('MySQL conectado ✅');
    return ejecutarMigraciones();
  })
  .catch(err => console.error('Error MySQL ❌', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});