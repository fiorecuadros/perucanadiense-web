const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const rutas = require('./rutas');
const archivos = require('./modulos/archivos/archivos.rutas');
const { noEncontrado, manejarErrores } = require('./middlewares/errores');

const app = express();

// Detrás de Passenger/Apache en cPanel: sin esto req.ip sería la del proxy y el
// limitador de intentos trataría a todo el mundo como un solo visitante.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    // El portal (otro origen) incrusta imágenes y PDFs servidos por este API.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }),
);

const origenesPermitidos = new Set(env.origenesCors);

app.use(
  cors({
    origin(origen, callback) {
      // Sin cabecera Origin (curl, health check del hosting) se permite.
      if (!origen) return callback(null, true);
      const limpio = origen.replace(/\/+$/, '');
      if (origenesPermitidos.has(limpio)) return callback(null, true);
      // Origen desconocido: sin cabecera CORS. El navegador lo bloquea.
      // No se lanza error: eso devolvería 500 y no un fallo de CORS.
      console.warn(`CORS: origen no permitido: ${origen}`);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));
app.use(morgan(env.produccion ? 'combined' : 'dev'));

app.use('/api', rutas);

// El frontend arma la URL pública de un archivo como baseUrl + /archivos/:id,
// sin el prefijo /api (endpoints.ts). Se atiende también ahí para que un enlace
// guardado con esa forma no quede roto.
app.use('/', archivos);

app.get('/', (_req, res) => res.json({ servicio: 'API IESPP Peruano Canadiense', salud: '/api/salud' }));

app.use(noEncontrado);
app.use(manejarErrores);

module.exports = app;
