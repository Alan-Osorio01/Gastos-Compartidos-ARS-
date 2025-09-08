// backend/server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');
// const xss = require('xss-clean'); // activa solo si es estable en tu entorno

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const expensesRoutes = require('./routes/expenses');

const app = express();

// Si hay proxy/reverse proxy (ALB, Nginx, CloudFront)
app.set('trust proxy', 1);

// Seguridad base
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false, // en API puede omitirse
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS con allowlist
const allowlist = [
  process.env.FRONTEND_ORIGIN,          // ej: http://localhost:3000
  'http://localhost:3000',              // hardcode útil en dev
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // permitir también llamadas sin Origin (curl, Postman)
    if (!origin || allowlist.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true, // si usas cookies
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

app.use(cors(corsOptions));
// habilita respuesta al preflight
app.options('*', cors(corsOptions));




// Body parsers seguros
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));

// Sanitización y hardening
app.use(mongoSanitize());
app.use(hpp());
// app.use(xss());
app.use(compression());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // <— importante
});
app.use('/api/auth', authLimiter);


// (Opcional) limitar creación/actualización de recursos
const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use(['/api/groups', '/api/expenses'], writeLimiter);

// Conectar DB
connectDB();

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expensesRoutes);

// 404 SOLO para endpoints de API desconocidos
app.use('/api', notFound);

// Frontend en producción (SPA)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(frontendPath));
  app.get('*', (_req, res) => res.sendFile(path.join(frontendPath, 'index.html'))); // ✅ con '*'
}


// Handler global de errores (SIEMPRE al final)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
