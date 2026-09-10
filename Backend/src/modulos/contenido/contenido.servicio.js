const repo = require('./contenido.repo');
const { leerJson } = require('../../lib/json');
const { aIso } = require('../../lib/fechas');
const { noEncontrado } = require('../../lib/errores');
const { normalizarNosotros } = require('./normalizar-nosotros');

function preparar(modulo, data) {
  return modulo === 'nosotros' ? normalizarNosotros(data) : data;
}

/**
 * Si un módulo aún no tiene fila, se devuelve su semilla; y si tampoco hay
 * semilla, `{}`: el frontend conserva entonces su copy local y la página nunca
 * se queda en blanco.
 */
async function obtener(modulo) {
  const fila = await repo.porModulo(modulo);
  if (fila) return preparar(modulo, leerJson(fila.data, {}));
  const semilla = await repo.semilla(modulo);
  return semilla ? preparar(modulo, leerJson(semilla.data, {})) : {};
}

async function guardar(modulo, data, usuarioId) {
  await repo.guardar(modulo, preparar(modulo, data), usuarioId);
  return obtener(modulo);
}

/** "Restaurar original" del panel: vuelve al copy oficial sembrado. */
async function restaurar(modulo, usuarioId) {
  const semilla = await repo.semilla(modulo);
  if (!semilla) throw noEncontrado('No hay contenido original registrado para este módulo.');
  const data = preparar(modulo, leerJson(semilla.data, {}));
  await repo.guardar(modulo, data, usuarioId);
  return data;
}

function aVersion(fila, conData = false) {
  const salida = {
    id: Number(fila.id),
    autor: fila.autor || 'sistema',
    fecha: aIso(fila.creado_en),
  };
  if (conData) salida.data = leerJson(fila.data, {});
  return salida;
}

async function versiones(modulo) {
  return (await repo.versiones(modulo)).map((fila) => aVersion(fila));
}

async function version(modulo, id) {
  const fila = await repo.versionPorId(modulo, id);
  if (!fila) throw noEncontrado('Versión no encontrada.');
  return aVersion(fila, true);
}

async function restaurarVersion(modulo, id, usuarioId) {
  const fila = await repo.versionPorId(modulo, id);
  if (!fila) throw noEncontrado('Versión no encontrada.');
  const data = preparar(modulo, leerJson(fila.data, {}));
  await repo.guardar(modulo, data, usuarioId);
  return data;
}

module.exports = { obtener, guardar, restaurar, versiones, version, restaurarVersion };
