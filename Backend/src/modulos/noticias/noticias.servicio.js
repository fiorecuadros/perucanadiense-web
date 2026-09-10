const repo = require('./noticias.repo');
const { leerJson } = require('../../lib/json');
const { aFechaCorta } = require('../../lib/fechas');
const { slugLibre } = require('../../lib/slug');
const { noEncontrado } = require('../../lib/errores');

const ETIQUETAS = { noticia: 'Noticia', comunicado: 'Comunicado', evento: 'Actividad' };

function aSalida(fila) {
  const salida = {
    id: fila.id,
    title: fila.titulo,
    category: fila.categoria,
    categoryLabel: fila.categoria_label,
    excerpt: fila.extracto || '',
    paragraphs: leerJson(fila.parrafos, []) || [],
    image: fila.imagen || '',
    imageAlt: fila.imagen_alt || '',
    createdAt: aFechaCorta(fila.fecha),
  };
  if (fila.destacada) salida.featured = true;
  salida.publicada = Boolean(fila.publicada);
  return salida;
}

const aFila = (n) => ({
  titulo: n.title,
  categoria: n.category,
  categoria_label: n.categoryLabel || ETIQUETAS[n.category] || 'Noticia',
  extracto: n.excerpt || '',
  parrafos: n.paragraphs || [],
  imagen: n.image || '',
  imagen_alt: n.imageAlt || '',
  fecha: aFechaCorta(n.createdAt) || aFechaCorta(new Date()),
  destacada: n.featured ? 1 : 0,
  publicada: n.publicada === false ? 0 : 1,
});

const listar = async () => (await repo.listar({ soloPublicadas: true })).map(aSalida);
const listarAdmin = async () => (await repo.listar({ soloPublicadas: false })).map(aSalida);

async function obtener(id, { publico = true } = {}) {
  const fila = await repo.porId(id);
  if (!fila) throw noEncontrado('Noticia no encontrada.');
  if (publico && !fila.publicada) throw noEncontrado('Noticia no encontrada.');
  return aSalida(fila);
}

/**
 * El id lo propone el navegador (slug + timestamp). Si ya existe, el servidor
 * genera uno libre en vez de fallar: dos editores publicando a la vez no deben
 * chocar. El frontend usa el objeto devuelto, así que se queda con el id final.
 */
async function crear(datos) {
  const propuesto = datos.id && datos.id.trim() ? datos.id.trim() : datos.title;
  const id = await slugLibre(propuesto, repo.existe);
  const fila = aFila(datos);
  await repo.crear({ ...fila, id });
  if (fila.destacada) await repo.quitarDestacadaSalvo(id, fila.categoria);
  return obtener(id, { publico: false });
}

async function actualizar(id, datos) {
  if (!(await repo.existe(id))) throw noEncontrado('Noticia no encontrada.');
  const fila = aFila(datos);
  await repo.actualizar(id, fila);
  if (fila.destacada) await repo.quitarDestacadaSalvo(id, fila.categoria);
  return obtener(id, { publico: false });
}

async function eliminar(id) {
  if (!(await repo.existe(id))) throw noEncontrado('Noticia no encontrada.');
  await repo.eliminar(id);
}

module.exports = { listar, listarAdmin, obtener, crear, actualizar, eliminar };
