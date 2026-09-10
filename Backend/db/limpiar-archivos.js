/**
 * Cruza la tabla `archivos` con las referencias vivas (documentos, repositorio,
 * mesa de partes y los JSON de contenido) y lista los binarios que nadie apunta.
 *
 *   node db/limpiar-archivos.js            (en seco: solo informa)
 *   node db/limpiar-archivos.js --borrar   (borra metadato y archivo en disco)
 */
const fs = require('fs/promises');
const path = require('path');
const { consultar, ejecutar, pool } = require('../src/config/db');
const { leerJson } = require('../src/lib/json');
const env = require('../src/config/env');

const BORRAR = process.argv.includes('--borrar');
const UUID = /\/(?:api\/)?archivos\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;

function extraerIds(valor, dest) {
  if (valor == null) return;
  if (typeof valor === 'string') {
    UUID.lastIndex = 0;
    let match;
    while ((match = UUID.exec(valor))) dest.add(match[1].toLowerCase());
    return;
  }
  if (Array.isArray(valor)) {
    for (const item of valor) extraerIds(item, dest);
    return;
  }
  if (typeof valor === 'object') {
    for (const item of Object.values(valor)) extraerIds(item, dest);
  }
}

async function idsDeColumna(sql) {
  const filas = await consultar(sql);
  return filas.map((f) => f.id).filter(Boolean);
}

async function principal() {
  const usados = new Set();

  for (const id of await idsDeColumna('SELECT archivo_id AS id FROM documentos WHERE archivo_id IS NOT NULL')) {
    usados.add(String(id).toLowerCase());
  }
  for (const id of await idsDeColumna('SELECT archivo_id AS id FROM repositorio WHERE archivo_id IS NOT NULL')) {
    usados.add(String(id).toLowerCase());
  }
  for (const id of await idsDeColumna(
    'SELECT archivo_id AS id FROM tramites_mesa_partes WHERE archivo_id IS NOT NULL',
  )) {
    usados.add(String(id).toLowerCase());
  }

  const jsons = await consultar(
    `SELECT data FROM contenido_modulos
     UNION ALL SELECT data FROM contenido_versiones
     UNION ALL SELECT data FROM semillas
     UNION ALL SELECT data FROM institucion`,
  );
  for (const fila of jsons) extraerIds(leerJson(fila.data, {}), usados);

  const textos = await consultar(
    `SELECT imagen AS v FROM noticias WHERE imagen IS NOT NULL AND imagen <> ''
     UNION ALL SELECT imagen FROM personal WHERE imagen IS NOT NULL AND imagen <> ''
     UNION ALL SELECT cv_url FROM personal WHERE cv_url IS NOT NULL AND cv_url <> ''
     UNION ALL SELECT imagen FROM programas WHERE imagen IS NOT NULL AND imagen <> ''
     UNION ALL SELECT url FROM documentos WHERE url IS NOT NULL AND url <> ''`,
  );
  for (const fila of textos) extraerIds(fila.v, usados);

  const archivos = await consultar(
    'SELECT id, nombre_original, ruta_relativa, bytes, creado_en FROM archivos ORDER BY creado_en',
  );
  const huerfanos = archivos.filter((a) => !usados.has(String(a.id).toLowerCase()));

  console.log(`${archivos.length} archivo(s) en la tabla · ${usados.size} referencia(s) vivas`);
  if (!huerfanos.length) {
    console.log('No hay archivos huérfanos.');
    await pool.end();
    return;
  }

  let bytes = 0;
  for (const a of huerfanos) {
    bytes += Number(a.bytes || 0);
    console.log(`  ${a.id}  ${a.nombre_original}  (${a.ruta_relativa})`);
  }
  console.log(`\n${huerfanos.length} huérfano(s) · ${(bytes / 1024).toFixed(1)} KB`);

  if (!BORRAR) {
    console.log('Modo seco. Para borrar: node db/limpiar-archivos.js --borrar');
    await pool.end();
    return;
  }

  let borrados = 0;
  for (const a of huerfanos) {
    const disco = path.join(env.archivos.directorio, a.ruta_relativa);
    await fs.unlink(disco).catch(() => {});
    await ejecutar('DELETE FROM archivos WHERE id = ?', [a.id]);
    borrados += 1;
  }
  console.log(`Borrados ${borrados} archivo(s).`);
  await pool.end();
}

principal().catch(async (error) => {
  console.error('No se pudieron listar los huérfanos:', error.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
