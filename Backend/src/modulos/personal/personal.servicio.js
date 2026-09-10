const repo = require('./personal.repo');
const { noEncontrado } = require('../../lib/errores');

function aSalida(fila) {
  const salida = {
    id: Number(fila.id),
    type: fila.tipo,
    names: fila.nombres,
    lastNames: fila.apellidos,
    position: fila.cargo,
    grade: fila.grado || '',
    email: fila.email || '',
    order: Number(fila.orden),
  };
  if (fila.area) salida.area = fila.area;
  if (fila.imagen) salida.image = fila.imagen;
  if (fila.cv_url) salida.cvUrl = fila.cv_url;
  return salida;
}

const aFila = (p) => ({
  tipo: p.type,
  nombres: p.names,
  apellidos: p.lastNames,
  cargo: p.position,
  area: p.area || null,
  grado: p.grade || null,
  email: p.email || null,
  imagen: p.image || null,
  cv_url: p.cvUrl || null,
  orden: p.order ?? 0,
});

const listar = async () => (await repo.listar()).map(aSalida);

async function obtener(id) {
  const fila = await repo.porId(id);
  if (!fila) throw noEncontrado('Integrante no encontrado.');
  return aSalida(fila);
}

/**
 * El `id` que manda el navegador (max + 1) se ignora: con dos editores a la vez
 * choca. Lo asigna la base y el frontend se queda con el objeto devuelto.
 */
async function crear(datos) {
  const fila = aFila(datos);
  if (!datos.order) fila.orden = await repo.siguienteOrden();
  const resultado = await repo.crear(fila);
  return obtener(resultado.insertId);
}

async function actualizar(id, datos) {
  if (!(await repo.porId(id))) throw noEncontrado('Integrante no encontrado.');
  await repo.actualizar(id, aFila(datos));
  return obtener(id);
}

async function eliminar(id) {
  if (!(await repo.porId(id))) throw noEncontrado('Integrante no encontrado.');
  await repo.eliminar(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar, aFila };
