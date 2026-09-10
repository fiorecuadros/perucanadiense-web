const repo = require('./programas.repo');
const { leerJson } = require('../../lib/json');
const { slugLibre } = require('../../lib/slug');
const { noEncontrado } = require('../../lib/errores');

function aSalida(fila) {
  return {
    id: fila.id,
    title: fila.titulo,
    level: fila.nivel,
    category: fila.categoria || '',
    duration: fila.duracion || '',
    durationSemesters: fila.duracion_semestres === null ? null : Number(fila.duracion_semestres),
    degreeAwarded: fila.titulo_otorgado || '',
    normative: fila.normativa || '',
    vacancies: Number(fila.vacantes),
    ageRange: fila.rango_edad || null,
    shifts: leerJson(fila.turnos, []) || [],
    description: fila.descripcion || '',
    profile: fila.perfil || '',
    fieldOfWork: leerJson(fila.campo_laboral, []) || [],
    image: fila.imagen || '',
    featured: Boolean(fila.destacado),
  };
}

const aFila = (p) => ({
  titulo: p.title,
  nivel: p.level,
  categoria: p.category || null,
  duracion: p.duration || null,
  duracion_semestres: p.durationSemesters ?? null,
  titulo_otorgado: p.degreeAwarded || null,
  normativa: p.normative || null,
  vacantes: p.vacancies ?? 0,
  rango_edad: p.ageRange || null,
  turnos: p.shifts || [],
  descripcion: p.description || null,
  perfil: p.profile || null,
  campo_laboral: p.fieldOfWork || [],
  imagen: p.image || null,
  destacado: p.featured ? 1 : 0,
});

const listar = async () => (await repo.listar({ soloActivos: true })).map(aSalida);

async function obtener(id) {
  const fila = await repo.porId(id);
  if (!fila || !fila.activo) throw noEncontrado('Programa no encontrado.');
  return aSalida(fila);
}

async function crear(datos) {
  const id = await slugLibre(datos.id || datos.title, repo.existe);
  const orden = await repo.siguienteOrden();
  await repo.crear({ ...aFila(datos), id, orden });
  return obtener(id);
}

async function actualizar(id, datos) {
  if (!(await repo.existe(id))) throw noEncontrado('Programa no encontrado.');
  await repo.actualizar(id, aFila(datos));
  return obtener(id);
}

async function eliminar(id) {
  if (!(await repo.existe(id))) throw noEncontrado('Programa no encontrado.');
  await repo.eliminar(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
