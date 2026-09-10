const repo = require('./menu.repo');
const { leerJson } = require('../../lib/json');
const { slugLibre } = require('../../lib/slug');
const { noEncontrado } = require('../../lib/errores');

const aSalida = (fila) => ({
  id: fila.id,
  zona: fila.zona,
  etiqueta: fila.etiqueta,
  destino: fila.destino,
  variante: fila.variante || undefined,
  orden: Number(fila.orden),
  visible: Boolean(fila.visible),
});

const aFila = (m) => ({
  zona: m.zona,
  etiqueta: m.etiqueta,
  destino: m.destino,
  variante: m.variante || null,
  orden: m.orden ?? 0,
  visible: m.visible === undefined ? 1 : m.visible ? 1 : 0,
});

/**
 * El portal pide el menú en cada carga: se devuelve ya agrupado por zona para
 * que la cabecera y el pie no tengan que filtrar nada.
 */
function agrupar(filas) {
  return filas.reduce((zonas, fila) => {
    (zonas[fila.zona] ||= []).push(aSalida(fila));
    return zonas;
  }, {});
}

const listarPublico = async () => agrupar(await repo.listarPublico());
const listarAdmin = async () => (await repo.listarTodo()).map(aSalida);

async function obtener(id) {
  const fila = await repo.porId(id);
  if (!fila) throw noEncontrado('Enlace del menú no encontrado.');
  return aSalida(fila);
}

/**
 * El id se deriva de la zona y la etiqueta (`principal-nosotros`): legible en la
 * base y en la auditoría. `slugLibre` resuelve el choque en el servidor, que es
 * donde se sabe lo que ya está tomado.
 */
async function crear(datos) {
  const fila = aFila(datos);
  if (datos.orden === undefined) fila.orden = await repo.siguienteOrden(datos.zona);
  const id = await slugLibre(`${datos.zona}-${datos.etiqueta}`, async (candidato) =>
    Boolean(await repo.porId(candidato)),
  );
  await repo.crear({ id, ...fila });
  return obtener(id);
}

async function actualizar(id, datos) {
  if (!(await repo.porId(id))) throw noEncontrado('Enlace del menú no encontrado.');
  await repo.actualizar(id, aFila(datos));
  return obtener(id);
}

async function eliminar(id) {
  if (!(await repo.porId(id))) throw noEncontrado('Enlace del menú no encontrado.');
  await repo.eliminar(id);
}

/** Reordenar: se aplican solo los ids que existen, el resto se ignora. */
async function reordenar(items) {
  let aplicados = 0;
  for (const { id, orden } of items) {
    if (!(await repo.porId(id))) continue;
    await repo.cambiarOrden(id, orden);
    aplicados += 1;
  }
  return { aplicados };
}

/**
 * "Restaurar original": repone el menú tal como se entregó. Es la salida cuando
 * alguien borra un enlace importante y no recuerda a dónde apuntaba.
 */
async function restaurar() {
  const fila = await repo.semilla();
  if (!fila) throw noEncontrado('No hay un menú original registrado. Ejecute la siembra.');
  const items = leerJson(fila.data, []);
  if (!Array.isArray(items) || !items.length) {
    throw noEncontrado('El menú original está vacío.');
  }

  await repo.vaciar();
  for (const item of items) {
    await repo.crear({ id: item.id, ...aFila(item) });
  }
  return listarAdmin();
}

module.exports = { listarPublico, listarAdmin, obtener, crear, actualizar, eliminar, reordenar, restaurar };
