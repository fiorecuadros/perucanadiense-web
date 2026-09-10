/**
 * Deja la base lista para estrenar: borra todo lo que se generó probando y
 * conserva el contenido del portal.
 *
 *   node db/preparar-produccion.js            # muestra qué haría, sin tocar nada
 *   node db/preparar-produccion.js --si       # lo ejecuta
 *
 * SE BORRA (rastro de pruebas):
 *   - los cinco buzones de trámites: la web es nueva, no hay expedientes reales
 *   - la tabla `archivos` y sus binarios en ALMACEN_DIR
 *   - `contenido_versiones`: historial de ediciones de prueba
 *   - `auditoria`: quién tocó qué mientras se desarrollaba
 *
 * SE CONSERVA (contenido real del portal):
 *   - `contenido_modulos`: misión, visión, historia y el resto del copy migrado
 *   - `semillas`: la copia original para el botón "Restaurar"
 *   - documentos, noticias, personal, programas, repositorio, institucion
 *   - las cuentas de usuario
 *
 * Los PDFs e imágenes del portal NO están aquí: son estáticos del frontend
 * (`Frontend/public/docs`, `Frontend/public/images`) o enlaces a SharePoint, y
 * viajan con el build a public_html. Este script no los toca.
 */
const fs = require('fs/promises');
const env = require('../src/config/env');
const { consultar, consultarUna, ejecutar, pool } = require('../src/config/db');

const ejecutar_de_verdad = process.argv.includes('--si');

const A_VACIAR = [
  ['tramites_mesa_partes', 'trámites de mesa de partes'],
  ['tramites_reclamaciones', 'hojas del libro de reclamaciones'],
  ['tramites_acceso_informacion', 'solicitudes de acceso a la información'],
  ['citas_psicopedagogicas', 'citas psicopedagógicas'],
  ['apoyo_social', 'solicitudes de apoyo social'],
  ['contenido_versiones', 'versiones del historial de contenido'],
  ['auditoria', 'entradas de auditoría'],
  ['archivos', 'archivos subidos (adjuntos de prueba)'],
];

const A_CONSERVAR = [
  ['contenido_modulos', 'módulos de contenido (misión, visión, historia…)'],
  ['semillas', 'copias originales para "Restaurar"'],
  ['documentos', 'documentos del portal'],
  ['noticias', 'noticias y comunicados'],
  ['personal', 'personal y docentes'],
  ['programas', 'programas de estudio'],
  ['repositorio', 'tesis del repositorio'],
  ['institucion', 'ficha institucional'],
  ['usuarios', 'cuentas del panel'],
];

const contar = async (tabla) => Number((await consultarUna(`SELECT COUNT(*) AS n FROM ${tabla}`)).n);

async function principal() {
  console.log('Preparar la base para producción\n');

  console.log('SE CONSERVA:');
  for (const [tabla, que] of A_CONSERVAR) {
    console.log(`  ${String(await contar(tabla)).padStart(5)}  ${que}`);
  }

  // Las cuentas se conservan, así que una creada para probar viajaría a
  // producción con su contraseña conocida. Se listan para que se vean.
  const cuentas = await consultar('SELECT username, nombre, rol FROM usuarios ORDER BY rol, username');
  console.log('\n  Cuentas que quedarán activas:');
  for (const c of cuentas) {
    console.log(`    ${c.username}  (${c.rol})  ${c.nombre}`);
  }
  if (cuentas.length > 1) {
    console.log('    Revise esta lista: las cuentas de prueba se borran desde /admin/usuarios.');
  }

  console.log('\nSE BORRA:');
  let total = 0;
  for (const [tabla, que] of A_VACIAR) {
    const n = await contar(tabla);
    total += n;
    console.log(`  ${String(n).padStart(5)}  ${que}`);
  }

  // Los binarios se cuentan aparte: viven en disco, no en la base.
  const archivos = await consultar('SELECT ruta_relativa FROM archivos');
  console.log(`  ${String(archivos.length).padStart(5)}  binarios en ${env.archivos.directorio}`);

  if (!ejecutar_de_verdad) {
    console.log(`\nNada se ha tocado. Son ${total} fila(s) y ${archivos.length} archivo(s).`);
    console.log('Para ejecutarlo de verdad: node db/preparar-produccion.js --si');
    return pool.end();
  }

  console.log('\nBorrando…');

  // Primero los binarios: si algo falla, la base aún los referencia y se puede
  // reintentar. Al revés quedarían archivos sueltos sin registro.
  let borrados = 0;
  for (const { ruta_relativa } of archivos) {
    try {
      await fs.unlink(`${env.archivos.directorio}/${ruta_relativa}`);
      borrados += 1;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error; // ya no estaba: da igual
    }
  }
  console.log(`  ${borrados} binario(s) eliminado(s) del disco`);

  // `archivos` la referencian documentos, repositorio y mesa de partes con
  // ON DELETE SET NULL, pero se vacía al final por claridad del orden.
  for (const [tabla, que] of A_VACIAR) {
    const n = await contar(tabla);
    await ejecutar(`DELETE FROM ${tabla}`);
    console.log(`  ${String(n).padStart(5)} ${que}`);
  }

  // Carpetas AAAA/MM vacías: no estorban, pero dejarlas es dejar rastro.
  try {
    for (const anio of await fs.readdir(env.archivos.directorio)) {
      const rutaAnio = `${env.archivos.directorio}/${anio}`;
      for (const mes of await fs.readdir(rutaAnio)) {
        await fs.rmdir(`${rutaAnio}/${mes}`).catch(() => {});
      }
      await fs.rmdir(rutaAnio).catch(() => {});
    }
  } catch {
    // Sin almacén todavía: no hay nada que recoger.
  }

  console.log('\nBase lista. Comprobación:');
  for (const [tabla] of A_VACIAR) {
    const n = await contar(tabla);
    console.log(`  ${tabla}: ${n}${n === 0 ? '' : '  ← DEBERÍA SER 0'}`);
  }

  await pool.end();
}

principal().catch(async (error) => {
  console.error('\nNo se pudo preparar la base:', error.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
