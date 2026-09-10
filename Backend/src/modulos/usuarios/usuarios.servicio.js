const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const repo = require('./usuarios.repo');
const { noEncontrado, conflicto, solicitudInvalida } = require('../../lib/errores');
const { aIso } = require('../../lib/fechas');

const RONDAS = 10;

const aSalida = (fila) => ({
  id: fila.id,
  nombre: fila.nombre,
  username: fila.username,
  email: fila.email,
  rol: fila.rol,
  activo: Boolean(fila.activo),
  ultimoAcceso: aIso(fila.ultimo_acceso),
  creadoEn: aIso(fila.creado_en),
});

const listar = async () => (await repo.listar()).map(aSalida);

async function obtener(id) {
  const fila = await repo.porId(id);
  if (!fila) throw noEncontrado('Usuario no encontrado.');
  return aSalida(fila);
}

async function crear(datos) {
  const id = crypto.randomUUID();
  const password_hash = await bcrypt.hash(datos.password, RONDAS);
  await repo.crear({ ...datos, id, email: datos.email || null, password_hash });
  return obtener(id);
}

async function actualizar(id, datos) {
  const actual = await repo.porId(id);
  if (!actual) throw noEncontrado('Usuario no encontrado.');

  // No dejar el panel sin ningún administrador activo.
  const dejaDeSerAdmin = actual.rol === 'admin' && (datos.rol !== 'admin' || !datos.activo);
  if (dejaDeSerAdmin && (await repo.contarAdmins()) <= 1) {
    throw conflicto('Debe quedar al menos un administrador activo.');
  }

  await repo.actualizar(id, { ...datos, email: datos.email || null });
  if (datos.password) {
    await repo.cambiarClave(id, await bcrypt.hash(datos.password, RONDAS));
  }
  return obtener(id);
}

async function eliminar(id, usuarioActualId) {
  const actual = await repo.porId(id);
  if (!actual) throw noEncontrado('Usuario no encontrado.');
  if (id === usuarioActualId) throw solicitudInvalida('No puede eliminar su propia cuenta.');
  if (actual.rol === 'admin' && (await repo.contarAdmins()) <= 1) {
    throw conflicto('Debe quedar al menos un administrador activo.');
  }
  await repo.eliminar(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
