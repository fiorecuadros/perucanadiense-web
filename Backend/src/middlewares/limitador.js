const rateLimit = require('express-rate-limit');

const respuesta = (mensaje) => (_req, res) => res.status(429).json({ message: mensaje });

/** Login: frena la fuerza bruta contra el panel. */
const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: respuesta('Demasiados intentos de inicio de sesión. Espere unos minutos.'),
});

/** Altas de trámites: son públicas, así que hay que acotarlas. */
const limitadorTramites = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: respuesta('Ha enviado demasiadas solicitudes. Intente nuevamente más tarde.'),
});

/** Consulta de seguimiento: el código es corto, no debe poder enumerarse. */
const limitadorSeguimiento = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: respuesta('Demasiadas consultas de seguimiento. Intente más tarde.'),
});

/** El asistente del portal es público y barato de martillar. */
const limitadorAsistente = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  handler: respuesta('Demasiadas consultas seguidas. Espere un momento o escríbanos por WhatsApp.'),
});

module.exports = { limitadorLogin, limitadorTramites, limitadorSeguimiento, limitadorAsistente };
