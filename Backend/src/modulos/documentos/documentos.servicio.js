const crypto = require('crypto');
const repo = require('./documentos.repo');
const { leerJson } = require('../../lib/json');
const { aIso } = require('../../lib/fechas');
const { noEncontrado } = require('../../lib/errores');

/** Fila de la base → objeto `DocumentoInstitucional` del frontend. */
function aSalida(fila) {
  const salida = {
    id: fila.id,
    modulo: fila.modulo,
    seccion: fila.seccion,
    titulo: fila.titulo,
    tipo: fila.tipo,
    url: fila.url,
    orden: Number(fila.orden),
    estado: fila.estado,
    actualizadoEn: aIso(fila.actualizado_en),
  };
  if (fila.descripcion) salida.descripcion = fila.descripcion;
  if (fila.anio) salida.anio = fila.anio;
  return salida;
}

const aFila = (d) => ({
  modulo: d.modulo,
  seccion: d.seccion,
  titulo: d.titulo,
  descripcion: d.descripcion || null,
  tipo: d.tipo,
  url: d.url,
  archivo_id: d.archivoId || null,
  anio: d.anio || null,
  orden: d.orden ?? 0,
  estado: d.estado || 'borrador',
});

const listar = async (filtros) => (await repo.listar(filtros)).map(aSalida);

async function obtener(id) {
  const fila = await repo.porId(id);
  if (!fila) throw noEncontrado('Documento no encontrado.');
  return aSalida(fila);
}

async function crear(datos) {
  const id = datos.id && datos.id.trim() ? datos.id.trim() : crypto.randomUUID();
  await repo.crear({ ...aFila(datos), id });
  return obtener(id);
}

async function actualizar(id, datos) {
  const existente = await repo.porId(id);
  if (!existente) throw noEncontrado('Documento no encontrado.');
  await repo.actualizar(id, aFila(datos));
  return obtener(id);
}

async function eliminar(id) {
  const existente = await repo.porId(id);
  if (!existente) throw noEncontrado('Documento no encontrado.');
  await repo.eliminar(id);
  return existente;
}

/**
 * Devuelve el módulo a los documentos oficiales de origen. Es la contraparte
 * del "Restaurar original" del panel, que hoy solo afecta al navegador.
 */
async function restaurarModulo(modulo) {
  const fila = await repo.semilla();
  const todos = leerJson(fila ? fila.data : null, []) || [];
  const delModulo = todos.filter((d) => d.modulo === modulo);

  await repo.eliminarModulo(modulo);
  for (const doc of delModulo) {
    // eslint-disable-next-line no-await-in-loop
    await repo.crear({ ...aFila(doc), id: doc.id || crypto.randomUUID() });
  }
  return listar({ modulo });
}

module.exports = { listar, obtener, crear, actualizar, eliminar, restaurarModulo };
