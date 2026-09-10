/**
 * Carga en la base el contenido oficial exportado a `db/semillas/datos/`.
 *
 * Dos escrituras distintas y a propósito:
 *   1. tabla `semillas`  → SIEMPRE se actualiza. Es la copia de referencia que
 *      usa "Restaurar original" del panel.
 *   2. tablas vivas      → solo se inserta lo que falta. Nunca se pisa lo que un
 *      editor ya cambió; para eso está `--forzar`.
 *
 *   npm run sembrar            (seguro, repetible)
 *   node db/sembrar.js --forzar (reescribe las tablas vivas)
 */
const fs = require('fs');
const path = require('path');
const { consultarUna, ejecutar, pool } = require('../src/config/db');
const { escribirJson } = require('../src/lib/json');

const DATOS = path.join(__dirname, 'semillas', 'datos');
const FORZAR = process.argv.includes('--forzar');

function leer(archivo) {
  const ruta = path.join(DATOS, archivo);
  if (!fs.existsSync(ruta)) {
    console.error(`Falta ${archivo}. Ejecute primero: npm run exportar-semillas`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}

const guardarSemilla = (clave, data) =>
  ejecutar(
    'INSERT INTO semillas (clave, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
    [clave, escribirJson(data)],
  );

const existe = async (tabla, columna, valor) =>
  Boolean(await consultarUna(`SELECT 1 AS x FROM ${tabla} WHERE ${columna} = ? LIMIT 1`, [valor]));

async function sembrarContenido() {
  const contenido = leer('contenido.json');
  let nuevos = 0;
  for (const [modulo, data] of Object.entries(contenido)) {
    await guardarSemilla(`contenido:${modulo}`, data);
    if (FORZAR || !(await existe('contenido_modulos', 'modulo', modulo))) {
      await ejecutar(
        `INSERT INTO contenido_modulos (modulo, data) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE data = VALUES(data)`,
        [modulo, escribirJson(data)],
      );
      nuevos += 1;
    }
  }
  console.log(`contenido: ${Object.keys(contenido).length} semillas · ${nuevos} módulo(s) escritos`);
}

async function sembrarDocumentos() {
  const documentos = leer('documentos.json');
  await guardarSemilla('documentos', documentos);
  let nuevos = 0;
  for (const d of documentos) {
    if (!FORZAR && (await existe('documentos', 'id', d.id))) continue;
    await ejecutar(
      `INSERT INTO documentos (id, modulo, seccion, titulo, descripcion, tipo, url, anio, orden, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE modulo = VALUES(modulo), seccion = VALUES(seccion), titulo = VALUES(titulo),
         descripcion = VALUES(descripcion), tipo = VALUES(tipo), url = VALUES(url), anio = VALUES(anio),
         orden = VALUES(orden), estado = VALUES(estado)`,
      [d.id, d.modulo, d.seccion, d.titulo, d.descripcion || null, d.tipo, d.url, d.anio || null, d.orden ?? 0, d.estado || 'publicado'],
    );
    nuevos += 1;
  }
  console.log(`documentos: ${documentos.length} semillas · ${nuevos} insertados`);
}

async function sembrarNoticias() {
  const noticias = leer('noticias.json');
  await guardarSemilla('noticias', noticias);
  let nuevas = 0;
  for (const n of noticias) {
    if (!FORZAR && (await existe('noticias', 'id', n.id))) continue;
    await ejecutar(
      `INSERT INTO noticias (id, titulo, categoria, categoria_label, extracto, parrafos, imagen, imagen_alt, fecha, destacada, publicada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE titulo = VALUES(titulo), categoria = VALUES(categoria),
         categoria_label = VALUES(categoria_label), extracto = VALUES(extracto), parrafos = VALUES(parrafos),
         imagen = VALUES(imagen), imagen_alt = VALUES(imagen_alt), fecha = VALUES(fecha), destacada = VALUES(destacada)`,
      [
        n.id, n.title, n.category, n.categoryLabel || 'Noticia', n.excerpt || '',
        escribirJson(n.paragraphs || []), n.image || '', n.imageAlt || '',
        n.createdAt || new Date().toISOString().slice(0, 10), n.featured ? 1 : 0,
      ],
    );
    nuevas += 1;
  }
  console.log(`noticias: ${noticias.length} semillas · ${nuevas} insertadas`);
}

async function sembrarPersonal() {
  const personal = leer('personal.json');
  await guardarSemilla('personal', personal);
  let nuevos = 0;
  for (const p of personal) {
    if (!FORZAR && (await existe('personal', 'id', p.id))) continue;
    await ejecutar(
      `INSERT INTO personal (id, tipo, nombres, apellidos, cargo, area, grado, email, imagen, cv_url, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE tipo = VALUES(tipo), nombres = VALUES(nombres), apellidos = VALUES(apellidos),
         cargo = VALUES(cargo), area = VALUES(area), grado = VALUES(grado), email = VALUES(email),
         imagen = VALUES(imagen), cv_url = VALUES(cv_url), orden = VALUES(orden)`,
      [p.id, p.type, p.names, p.lastNames, p.position, p.area || null, p.grade || null, p.email || null, p.image || null, p.cvUrl || null, p.order ?? 0],
    );
    nuevos += 1;
  }
  console.log(`personal: ${personal.length} semillas · ${nuevos} insertados`);
}

async function sembrarRepositorio() {
  const tesis = leer('repositorio.json');
  await guardarSemilla('repositorio', tesis);
  let nuevas = 0;
  for (const t of tesis) {
    if (!FORZAR && (await existe('repositorio', 'id', t.id))) continue;
    await ejecutar(
      `INSERT INTO repositorio (id, titulo, autores, programa, anio, tipo, nivel, resumen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE titulo = VALUES(titulo), autores = VALUES(autores), programa = VALUES(programa),
         anio = VALUES(anio), tipo = VALUES(tipo), nivel = VALUES(nivel), resumen = VALUES(resumen)`,
      [t.id, t.titulo, escribirJson(t.autores || []), t.programa, String(t.anio), t.tipo || 'Tesis', t.nivel || null, t.resumen || null],
    );
    nuevas += 1;
  }
  console.log(`repositorio: ${tesis.length} semillas · ${nuevas} insertadas`);
}

async function sembrarProgramas() {
  const programas = leer('programas.json');
  await guardarSemilla('programas', programas);
  let nuevos = 0;
  let orden = 0;
  for (const p of programas) {
    orden += 1;
    if (!FORZAR && (await existe('programas', 'id', p.id))) continue;
    await ejecutar(
      `INSERT INTO programas (id, titulo, nivel, categoria, duracion, duracion_semestres, titulo_otorgado,
         normativa, vacantes, rango_edad, turnos, descripcion, perfil, campo_laboral, imagen, destacado, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE titulo = VALUES(titulo), nivel = VALUES(nivel), categoria = VALUES(categoria),
         duracion = VALUES(duracion), duracion_semestres = VALUES(duracion_semestres),
         titulo_otorgado = VALUES(titulo_otorgado), normativa = VALUES(normativa), vacantes = VALUES(vacantes),
         rango_edad = VALUES(rango_edad), turnos = VALUES(turnos), descripcion = VALUES(descripcion),
         perfil = VALUES(perfil), campo_laboral = VALUES(campo_laboral), imagen = VALUES(imagen),
         destacado = VALUES(destacado), orden = VALUES(orden)`,
      [
        p.id, p.title, p.level, p.category || null, p.duration || null, p.durationSemesters ?? null,
        p.degreeAwarded || null, p.normative || null, p.vacancies ?? 0, p.ageRange || null,
        escribirJson(p.shifts || []), p.description || null, p.profile || null,
        escribirJson(p.fieldOfWork || []), p.image || null, p.featured ? 1 : 0, orden,
      ],
    );
    nuevos += 1;
  }
  console.log(`programas: ${programas.length} semillas · ${nuevos} insertados`);
}

async function sembrarInstitucion() {
  const ficha = leer('institucion.json');
  await guardarSemilla('institucion', ficha);
  if (FORZAR || !(await existe('institucion', 'id', 1))) {
    await ejecutar(
      'INSERT INTO institucion (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
      [escribirJson(ficha)],
    );
    console.log('institucion: ficha escrita');
  } else {
    console.log('institucion: semilla actualizada (la ficha viva se respeta)');
  }
}

/**
 * El menú de navegación. Es lo que pinta la cabecera y el pie del portal, y lo
 * que repone "Restaurar original" del panel.
 */
async function sembrarMenu() {
  const items = leer('menu.json');
  await guardarSemilla('menu', items);

  let nuevos = 0;
  for (const m of items) {
    if (!FORZAR && (await existe('menu_items', 'id', m.id))) continue;
    await ejecutar(
      `INSERT INTO menu_items (id, zona, etiqueta, destino, variante, orden, visible)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE zona = VALUES(zona), etiqueta = VALUES(etiqueta),
         destino = VALUES(destino), variante = VALUES(variante), orden = VALUES(orden),
         visible = VALUES(visible)`,
      [m.id, m.zona, m.etiqueta, m.destino, m.variante || null, m.orden ?? 0, m.visible === false ? 0 : 1],
    );
    nuevos += 1;
  }
  console.log(`menu: ${items.length} semillas · ${nuevos} enlace(s) escritos`);
}

async function principal() {
  console.log(FORZAR ? 'Sembrando (modo --forzar: se sobrescriben las tablas vivas)\n' : 'Sembrando\n');
  await sembrarContenido();
  await sembrarDocumentos();
  await sembrarNoticias();
  await sembrarPersonal();
  await sembrarRepositorio();
  await sembrarProgramas();
  await sembrarInstitucion();
  await sembrarMenu();
  console.log('\nSemillas cargadas.');
  await pool.end();
}

principal().catch(async (error) => {
  console.error('Error al sembrar:', error.sqlMessage || error.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
