const asincrono = require('../../lib/asincrono');
const servicio = require('./auth.servicio');
const { registrar } = require('../../lib/auditoria');

const login = asincrono(async (req, res) => {
  const { username, password } = req.body;
  const sesion = await servicio.iniciarSesion(username, password);
  req.usuario = sesion.user;
  await registrar(req, { accion: 'login', entidad: 'auth', entidadId: sesion.user.id });
  res.json(sesion);
});

/** El front vuelve a pedir la sesión al recargar el panel. */
const yo = asincrono(async (req, res) => {
  res.json({ token: (req.headers.authorization || '').slice(7), user: req.usuario });
});

/**
 * El token es sin estado: el cierre efectivo es que el navegador lo borre.
 * Se responde 204 para que el front tenga un punto de salida y quede auditado.
 */
const logout = asincrono(async (req, res) => {
  await registrar(req, { accion: 'logout', entidad: 'auth', entidadId: req.usuario.id });
  res.status(204).end();
});

/**
 * Al cambiar la clave, el token actual deja de valer (lo invalida
 * `password_actualizada_en`). Se avisa al front para que mande a iniciar sesión
 * de nuevo en vez de dejar al usuario clicando y recibiendo 401.
 */
const cambiarClave = asincrono(async (req, res) => {
  const { actual, nueva } = req.body;
  await servicio.cambiarClavePropia(req.usuario.id, actual, nueva);
  await registrar(req, { accion: 'cambiar-clave', entidad: 'auth', entidadId: req.usuario.id });
  res.json({ ok: true, sesionCerrada: true });
});

module.exports = { login, yo, logout, cambiarClave };
