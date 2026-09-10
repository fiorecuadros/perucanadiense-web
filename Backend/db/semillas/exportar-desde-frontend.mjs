/**
 * Exporta el contenido oficial desde las constantes del Angular a JSON.
 *
 * La fuente de verdad del copy institucional es `Frontend/src/app/core/constants`.
 * Copiarlo a mano al SQL garantiza que en unos meses las dos versiones digan
 * cosas distintas; aquí se lee el .ts directamente (Node ejecuta TypeScript sin
 * compilar desde la v22.18) y se vuelca tal cual.
 *
 *   npm run exportar-semillas
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CONSTANTES = path.resolve(AQUI, '../../../Frontend/src/app/core/constants');
const DESTINO = path.join(AQUI, 'datos');

const importar = (archivo) => import(path.join(CONSTANTES, archivo));

const MODULOS = [
  ['inicio', 'inicio.constant.ts', 'INICIO_COPY'],
  ['nosotros', 'about.constant.ts', 'ABOUT_COPY'],
  ['admision', 'admission.constant.ts', 'ADMISSION_COPY'],
  ['becas', 'becas.constant.ts', 'BECAS_COPY'],
  ['costos', 'costos.constant.ts', 'COSTOS_COPY'],
  ['estadisticas', 'estadisticas.constant.ts', 'ESTADISTICAS_COPY'],
  ['horarios', 'horarios.constant.ts', 'HORARIOS_COPY'],
  ['inversiones', 'inversiones.constant.ts', 'INVERSIONES_COPY'],
  ['licenciamiento', 'licenciamiento.constant.ts', 'LICENCIAMIENTO_COPY'],
  ['servicios', 'servicios.constant.ts', 'SERVICIOS_COPY'],
  ['transparencia', 'transparencia.constant.ts', 'TRANSPARENCIA_COPY'],
  ['reglamentos', 'reglamentos.constant.ts', 'REGLAMENTOS_COPY'],
  ['procedimientos', 'procedimientos.constant.ts', 'PROCEDIMIENTOS_COPY'],
  ['psicopedagogico', 'bienestar.constant.ts', 'PSICOPEDAGOGICO_COPY'],
  ['servicio-social', 'bienestar.constant.ts', 'SERVICIO_SOCIAL_COPY'],
  ['soporte-medico', 'bienestar.constant.ts', 'SOPORTE_MEDICO_COPY'],
  ['reclamaciones', 'reclamaciones.constant.ts', 'RECLAMACIONES_COPY'],
  ['privacidad', 'legal.constant.ts', 'PRIVACY_COPY'],
  ['repositorio-copy', 'repositorio.constant.ts', 'REPOSITORIO_COPY'],
];

const COLECCIONES = [
  ['documentos', 'documentos.seed.ts', 'DOCUMENTOS_SEED'],
  ['noticias', 'news.constant.ts', 'NEWS_ITEMS'],
  ['personal', 'faculty.constant.ts', 'FACULTY_MEMBERS'],
  ['repositorio', 'repositorio.constant.ts', 'REPOSITORIO_ITEMS'],
  ['programas', 'programs.constant.ts', 'ACADEMIC_PROGRAMS'],
  ['institucion', 'institution.constant.ts', 'INSTITUTION'],
  ['menu', 'navigation.constant.ts', 'NAVIGATION'],
];

async function tomar(archivo, exportacion) {
  const modulo = await importar(archivo);
  const valor = modulo[exportacion];
  if (valor === undefined) {
    throw new Error(`${archivo} no exporta ${exportacion}`);
  }
  return JSON.parse(JSON.stringify(valor));
}

async function principal() {
  await mkdir(DESTINO, { recursive: true });
  const contenido = {};

  for (const [modulo, archivo, exportacion] of MODULOS) {
    contenido[modulo] = await tomar(archivo, exportacion);
    console.log(`contenido:${modulo} ← ${archivo}`);
  }
  await writeFile(path.join(DESTINO, 'contenido.json'), `${JSON.stringify(contenido, null, 2)}\n`);

  for (const [nombre, archivo, exportacion] of COLECCIONES) {
    const datos = await tomar(archivo, exportacion);
    await writeFile(path.join(DESTINO, `${nombre}.json`), `${JSON.stringify(datos, null, 2)}\n`);
    const cuantos = Array.isArray(datos) ? `${datos.length} registro(s)` : 'ficha';
    console.log(`${nombre} ← ${archivo} (${cuantos})`);
  }

  console.log(`\nSemillas escritas en ${path.relative(process.cwd(), DESTINO)}`);
}

principal().catch((error) => {
  console.error('No se pudieron exportar las semillas:', error.message);
  process.exit(1);
});
