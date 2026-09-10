/**
 * Mueve el almacén de archivos a otra carpeta, verificando que no se pierde ni
 * se corrompe nada por el camino.
 *
 *   node scripts/mover-almacen.js /home/usuario/almacen_pcanadiense
 *   node scripts/mover-almacen.js /ruta/destino --borrar-origen
 *
 * Por qué existe: los binarios (adjuntos de mesa de partes con datos personales,
 * PDFs del portal) viven fuera de la base, y su ruta la fija ALMACEN_DIR. En
 * cPanel esa carpeta debe quedar FUERA del Application root, o un redespliegue
 * la borra; y nunca dentro de public_html, o Apache la serviría sin pasar por el
 * control de acceso del API.
 *
 * Qué hace:
 *   1. Comprueba que cada archivo de la base está en disco (y avisa de huérfanos).
 *   2. Copia respetando AAAA/MM/ y verifica el sha256 de cada copia.
 *   3. Deja permisos restrictivos: 700 en carpetas, 600 en archivos.
 *   4. Solo borra el origen si se lo pide y todo cuadró.
 *
 * No toca el .env: dice qué línea cambiar y el momento de reiniciar lo decide
 * usted. Mientras no cambie ALMACEN_DIR, el API sigue leyendo del origen.
 */
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const env = require('../src/config/env');
const { consultar, pool } = require('../src/config/db');

const PERMISO_CARPETA = 0o700;
const PERMISO_ARCHIVO = 0o600;

const destinoArg = process.argv[2];
const borrarOrigen = process.argv.includes('--borrar-origen');

function abortar(mensaje) {
  console.error(`\n${mensaje}`);
  return pool.end().then(() => process.exit(1));
}

const sha256De = async (ruta) =>
  crypto.createHash('sha256').update(await fs.readFile(ruta)).digest('hex');

/** ¿Está el destino dentro de una carpeta que sirve el servidor web? */
function pareceExpuesta(ruta) {
  const partes = ruta.split(path.sep);
  return partes.includes('public_html') || partes.includes('public') || partes.includes('www');
}

async function principal() {
  if (!destinoArg) {
    console.error('Uso: node scripts/mover-almacen.js <carpeta-destino> [--borrar-origen]');
    console.error('Ejemplo cPanel: node scripts/mover-almacen.js /home/usuario/almacen_pcanadiense');
    return pool.end().then(() => process.exit(1));
  }

  const origen = env.archivos.directorio;
  const destino = path.resolve(destinoArg);

  console.log('Mudanza del almacén');
  console.log(`  origen : ${origen}`);
  console.log(`  destino: ${destino}\n`);

  if (origen === destino) return abortar('El origen y el destino son la misma carpeta.');
  if (destino.startsWith(origen + path.sep)) {
    return abortar('El destino está dentro del origen: elija una carpeta fuera de él.');
  }
  if (pareceExpuesta(destino)) {
    return abortar(
      `El destino cuelga de una carpeta pública (public_html/public/www).\n` +
        'Ahí Apache serviría los adjuntos sin pasar por el API y el control de acceso no valdría.',
    );
  }

  try {
    await fs.access(origen);
  } catch {
    return abortar(`No existe la carpeta de origen: ${origen}`);
  }

  // 1. ¿Cuadra la base con el disco?
  console.log('1. Comprobando base contra disco');
  const filas = await consultar('SELECT id, ruta_relativa, sha256, nombre_original, publico FROM archivos');
  const faltantes = [];
  for (const fila of filas) {
    try {
      await fs.access(path.join(origen, fila.ruta_relativa));
    } catch {
      faltantes.push(fila);
    }
  }
  console.log(`   ${filas.length} archivo(s) registrado(s) en la base`);
  if (faltantes.length) {
    console.log(`   AVISO ${faltantes.length} registrado(s) pero ausente(s) en disco:`);
    for (const fila of faltantes) console.log(`         ${fila.ruta_relativa} (${fila.nombre_original})`);
    console.log('   Se seguirá con los que sí están; revise esos con db/limpiar-archivos.js.');
  }

  const registradas = new Set(filas.map((f) => f.ruta_relativa.split(path.sep).join('/')));
  const enDisco = [];
  async function recorrer(carpeta, prefijo = '') {
    for (const entrada of await fs.readdir(carpeta, { withFileTypes: true })) {
      const relativa = prefijo ? `${prefijo}/${entrada.name}` : entrada.name;
      if (entrada.isDirectory()) await recorrer(path.join(carpeta, entrada.name), relativa);
      else enDisco.push(relativa);
    }
  }
  await recorrer(origen);
  const huerfanos = enDisco.filter((r) => !registradas.has(r));
  if (huerfanos.length) {
    console.log(`   AVISO ${huerfanos.length} archivo(s) en disco sin registro en la base:`);
    for (const ruta of huerfanos.slice(0, 10)) console.log(`         ${ruta}`);
    console.log('   Se copian igual: perder un adjunto es peor que copiar uno de más.');
  }

  // 2. Copiar y verificar
  console.log('\n2. Copiando y verificando');
  let copiados = 0;
  const corruptos = [];
  const porRuta = new Map(filas.map((f) => [f.ruta_relativa.split(path.sep).join('/'), f]));

  await fs.mkdir(destino, { recursive: true, mode: PERMISO_CARPETA });
  await fs.chmod(destino, PERMISO_CARPETA);

  for (const relativa of enDisco) {
    const desde = path.join(origen, ...relativa.split('/'));
    const hasta = path.join(destino, ...relativa.split('/'));
    await fs.mkdir(path.dirname(hasta), { recursive: true, mode: PERMISO_CARPETA });
    await fs.copyFile(desde, hasta);
    await fs.chmod(hasta, PERMISO_ARCHIVO);

    // El sha256 de la base es la referencia; si no lo hay, se compara origen
    // contra destino para descartar una copia truncada.
    const registro = porRuta.get(relativa);
    const esperado = registro && registro.sha256 ? registro.sha256 : await sha256De(desde);
    const obtenido = await sha256De(hasta);
    if (esperado !== obtenido) corruptos.push(relativa);
    else copiados += 1;
  }

  // Permisos también en las carpetas intermedias que se crearon.
  async function endurecer(carpeta) {
    await fs.chmod(carpeta, PERMISO_CARPETA);
    for (const entrada of await fs.readdir(carpeta, { withFileTypes: true })) {
      if (entrada.isDirectory()) await endurecer(path.join(carpeta, entrada.name));
    }
  }
  await endurecer(destino);

  console.log(`   ${copiados} de ${enDisco.length} archivo(s) copiados y verificados por sha256`);
  console.log(`   permisos: 700 en carpetas, 600 en archivos (solo el dueño los lee)`);

  if (corruptos.length) {
    console.log(`\n   FALLA ${corruptos.length} copia(s) no coinciden con su sha256:`);
    for (const ruta of corruptos) console.log(`         ${ruta}`);
    return abortar('No se borra nada. Revise el destino antes de repetir.');
  }

  // 3. Borrado del origen, solo si se pidió y todo cuadró
  if (borrarOrigen) {
    console.log('\n3. Borrando el origen (todo verificado)');
    await fs.rm(origen, { recursive: true, force: true });
    console.log(`   ${origen} eliminado`);
  } else {
    console.log('\n3. El origen se conserva. Bórrelo cuando compruebe que el API funciona:');
    console.log(`   rm -rf ${origen}`);
    console.log('   (o repita con --borrar-origen)');
  }

  console.log('\nSiguiente paso — cambie esta línea del .env y reinicie el API:');
  console.log(`   ALMACEN_DIR=${destino}`);
  console.log('Luego: node scripts/verificar-archivos.js');

  await pool.end();
}

principal().catch(async (error) => {
  console.error('\nNo se pudo completar la mudanza:', error.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
