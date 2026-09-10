const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const repo = require('./auth.repo');
const { noAutorizado } = require('../../lib/errores');

const sesionDe = (usuario) => ({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol });

async function iniciarSesion(username, password) {
  const usuario = await repo.porCredencial(username);

  // Mismo mensaje y mismo coste en ambos casos: no se revela si el usuario existe.
  if (!usuario || !usuario.activo) {
    await bcrypt.compare(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva');
    throw noAutorizado('Usuario o contraseña incorrectos.');
  }

  const correcta = await bcrypt.compare(password, usuario.password_hash);
  if (!correcta) throw noAutorizado('Usuario o contraseña incorrectos.');

  const token = jwt.sign({ sub: usuario.id, rol: usuario.rol }, env.jwt.secreto, {
    expiresIn: env.jwt.expira,
  });

  await repo.marcarAcceso(usuario.id);
  return { token, user: sesionDe(usuario) };
}

/**
 * Cambio de la propia contraseña. Existe aparte de /admin/usuarios porque ese
 * módulo es solo para administradores: sin esto, un editor no podría rotar su
 * clave nunca y dependería de que alguien se la cambiara.
 *
 * Se exige la contraseña actual: con el token robado no basta para secuestrar
 * la cuenta.
 */
async function cambiarClavePropia(usuarioId, actual, nueva) {
  const usuario = await repo.porId(usuarioId);
  if (!usuario || !usuario.activo) throw noAutorizado('La sesión ya no es válida.');

  const correcta = await bcrypt.compare(actual, usuario.password_hash);
  if (!correcta) throw noAutorizado('La contraseña actual no es correcta.');

  await repo.cambiarClave(usuarioId, await bcrypt.hash(nueva, 10));
}

module.exports = { iniciarSesion, sesionDe, cambiarClavePropia };
