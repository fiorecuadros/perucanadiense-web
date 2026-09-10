const repo = require('./repositorio.repo');
const { leerJson } = require('../../lib/json');
const { slugLibre } = require('../../lib/slug');
const { noEncontrado } = require('../../lib/errores');
const { urlPublica } = require('../archivos/archivos.servicio');

function aSalida(fila) {
  const salida = {
    id: fila.id,
    titulo: fila.titulo,
    autores: leerJson(fila.autores, []) || [],
    programa: fila.programa,
    anio: fila.anio,
    tipo: fila.tipo,
    nivel: fila.nivel || '',
    resumen: fila.resumen || '',
  };
  // El front muestra un aviso cuando la tesis no tiene PDF archivado; con esto
  // deja de mostrarlo en cuanto alguien suba el archivo real.
  if (fila.archivo_id) salida.pdfUrl = urlPublica(fila.archivo_id);
  return salida;
}

const aFila = (t) => ({
  titulo: t.titulo,
  autores: t.autores,
  programa: t.programa,
  anio: t.anio,
  tipo: t.tipo || 'Tesis',
  nivel: t.nivel || null,
  resumen: t.resumen || null,
});

const listar = async () => (await repo.listar()).map(aSalida);

async function obtener(id) {
  const fila = await repo.porId(id);
  if (!fila) throw noEncontrado('Investigación no encontrada.');
  return aSalida(fila);
}

async function crear(datos) {
  const id = await slugLibre(datos.id || datos.titulo, repo.existe);
  await repo.crear({ ...aFila(datos), id });
  return obtener(id);
}

async function actualizar(id, datos) {
  if (!(await repo.existe(id))) throw noEncontrado('Investigación no encontrada.');
  await repo.actualizar(id, aFila(datos));
  return obtener(id);
}

async function adjuntar(id, archivoId) {
  if (!(await repo.existe(id))) throw noEncontrado('Investigación no encontrada.');
  await repo.asignarArchivo(id, archivoId);
  return obtener(id);
}

async function eliminar(id) {
  if (!(await repo.existe(id))) throw noEncontrado('Investigación no encontrada.');
  await repo.eliminar(id);
}

module.exports = { listar, obtener, crear, actualizar, adjuntar, eliminar };
