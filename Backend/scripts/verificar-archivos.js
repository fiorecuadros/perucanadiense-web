/**
 * Verificación del almacén: dónde caen los binarios y quién puede abrirlos.
 *
 * Los adjuntos que un ciudadano sube por mesa de partes llevan su DNI y el
 * asunto de su trámite. Los documentos del portal (PTI, reglamentos, tesis) son
 * públicos a propósito. Las dos cosas viven en el mismo almacén y se sirven por
 * la misma ruta, así que la frontera hay que comprobarla.
 *
 *   node scripts/verificar-archivos.js
 */
const fs = require('fs');
const path = require('path');
const env = require('../src/config/env');

// Por defecto el servidor local. Con API_URL se apunta a producción:
//   API_URL=https://api.pcanadiense.edu.pe/api node scripts/<script>.js
const BASE = process.env.API_URL || `http://localhost:${env.puerto}/api`;
const usuario = process.argv[2] || env.admin.usuario;
const clave = process.argv[3] || env.admin.clave;

let token = null;
let pasadas = 0;
let fallidas = 0;

function comprobar(descripcion, condicion, detalle = '') {
  if (condicion) {
    pasadas += 1;
    console.log(`  ok   ${descripcion}`);
  } else {
    fallidas += 1;
    console.log(`  FALLA ${descripcion}${detalle ? ` → ${detalle}` : ''}`);
  }
}

async function pedir(metodo, ruta, { cuerpo, autenticado = false, crudo = false } = {}) {
  const cabeceras = {};
  if (autenticado && token) cabeceras.Authorization = `Bearer ${token}`;
  if (cuerpo && !(cuerpo instanceof FormData)) cabeceras['Content-Type'] = 'application/json';
  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: cuerpo instanceof FormData ? cuerpo : cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (crudo) {
    return {
      estado: respuesta.status,
      texto: await respuesta.text(),
      cache: respuesta.headers.get('cache-control'),
    };
  }
  const datos = (respuesta.headers.get('content-type') || '').includes('json')
    ? await respuesta.json().catch(() => null)
    : null;
  return { estado: respuesta.status, datos };
}

/**
 * El alta de trámites está limitada a 10 por hora e IP a propósito. Al repetir
 * la suite se agota esa cuota: hay que decirlo, no encadenar fallos que parecen
 * una regresión. El contador vive en memoria, así que reiniciar el API lo borra.
 */
function abortarSiLimitado(respuesta) {
  if (respuesta.estado !== 429) return false;
  console.log('\n  El API está limitando las altas de trámites (429), que es lo correcto:');
  console.log('  son públicas y se acotan a 10 por hora e IP.');
  console.log('  Reinicie el API para vaciar el contador y vuelva a lanzar la verificación.');
  return true;
}

const pdf = (texto) => new Blob([`%PDF-1.4\n${texto}\n%%EOF\n`], { type: 'application/pdf' });

async function principal() {
  const login = await pedir('POST', '/auth/login', { cuerpo: { username: usuario, password: clave } });
  if (!login.datos || !login.datos.token) {
    console.error('No se pudo iniciar sesión. Revise ADMIN_USUARIO / ADMIN_CLAVE.');
    process.exit(1);
  }
  token = login.datos.token;
  console.log(`Verificando el almacén contra ${BASE}\n`);

  const remoto = Boolean(process.env.API_URL);

  console.log('1. Dónde se guardan los binarios');
  if (remoto) {
    console.log('  omitido  se audita un servidor remoto: ALMACEN_DIR es el de esta máquina,');
    console.log('           no el del servidor. Compruébelo allí con el .env de producción.');
  } else {
  const dentroDelProyecto = env.archivos.directorio.startsWith(env.raiz);
  comprobar('ALMACEN_DIR está configurado', !!env.archivos.directorio, env.archivos.directorio);
  comprobar(
    'el almacén NO cuelga de public/ (Apache no lo serviría directo)',
    !env.archivos.directorio.includes(`${path.sep}public${path.sep}`) &&
      !env.archivos.directorio.endsWith(`${path.sep}public`),
    env.archivos.directorio,
  );
  if (dentroDelProyecto) {
    console.log('  nota  el almacén está dentro del proyecto; en cPanel conviene sacarlo del');
    console.log('        Application root (ALMACEN_DIR=/home/usuario/almacen_pcanadiense).');
  }
  }

  console.log('\n2. Un documento del portal es público a propósito');
  const cuerpoPublico = new FormData();
  cuerpoPublico.append('file', pdf('reglamento institucional'), 'reglamento.pdf');
  const publico = await pedir('POST', '/archivos', { cuerpo: cuerpoPublico, autenticado: true });
  comprobar('el panel puede subirlo', publico.estado === 201, `estado ${publico.estado}`);
  const anonimoPublico = await pedir('GET', `/archivos/${publico.datos.id}`, { crudo: true });
  comprobar('un anónimo lo descarga', anonimoPublico.estado === 200, `estado ${anonimoPublico.estado}`);
  comprobar('se deja cachear', (anonimoPublico.cache || '').includes('public'), anonimoPublico.cache);

  if (!remoto) {
    // La raíz la fija quien despliega; las carpetas AAAA/MM las crea la app y
    // heredaban la umask (755/644). Con la raíz en 700 nadie llega, pero basta
    // restaurar o recrear esa raíz para dejar los adjuntos legibles.
    const modo = (ruta) => (fs.statSync(ruta).mode & 0o777).toString(8);
    const anio = new Date().getUTCFullYear();
    const mes = String(new Date().getUTCMonth() + 1).padStart(2, '0');
    const carpetaMes = path.join(env.archivos.directorio, String(anio), mes);
    if (fs.existsSync(carpetaMes)) {
      comprobar('las carpetas AAAA/MM quedan en 700', modo(carpetaMes) === '700', modo(carpetaMes));
      const pdfs = fs.readdirSync(carpetaMes).filter((f) => f.endsWith('.pdf'));
      if (pdfs.length) {
        const uno = path.join(carpetaMes, pdfs[0]);
        comprobar('los binarios quedan en 600', modo(uno) === '600', modo(uno));
      }
    }
  }

  console.log('\n3. El adjunto de un trámite es reservado');
  const secreto = `DNI 70123456 reservado ${Date.now()}`;
  const alta = new FormData();
  alta.append('file', pdf(secreto), 'solicitud.pdf');
  for (const [campo, valor] of Object.entries({
    nombres: 'Julio Ramos Ticona',
    dni: '70998877',
    correo: 'julio.prueba@example.com',
    telefono: '912345678',
    condicion: 'Egresado',
    tipoDoc: 'Solicitud',
    folios: '2',
    asunto: 'Solicitud de certificado de estudios',
    mensaje: 'Adjunto mi solicitud firmada.',
  })) {
    alta.append(campo, valor);
  }
  const tramite = await pedir('POST', '/tramites/mesa-de-partes', { cuerpo: alta });
  if (abortarSiLimitado(tramite)) process.exit(2);
  comprobar('el ciudadano lo presenta sin sesión', tramite.estado === 201, `estado ${tramite.estado}`);

  const bandeja = await pedir('GET', '/admin/mesa-de-partes', { autenticado: true });
  const registro = (bandeja.datos || []).find((t) => t.codigo === tramite.datos.trackingCode);
  comprobar('el panel ve el trámite', !!registro);
  const urlAdjunto = registro && registro.payload.archivoUrl;
  comprobar('el trámite expone la URL del adjunto', !!urlAdjunto, JSON.stringify(registro && registro.payload));
  if (!urlAdjunto) return;

  const idAdjunto = urlAdjunto.replace('/api/archivos/', '');
  const anonimo = await pedir('GET', `/archivos/${idAdjunto}`, { crudo: true });
  comprobar('un anónimo NO lo descarga (401)', anonimo.estado === 401, `estado ${anonimo.estado}`);
  comprobar('y el contenido no se filtra en la respuesta', !anonimo.texto.includes(secreto));

  const conSesion = await pedir('GET', `/archivos/${idAdjunto}`, { autenticado: true, crudo: true });
  comprobar('el panel sí lo abre (200)', conSesion.estado === 200, `estado ${conSesion.estado}`);
  comprobar('y recibe el contenido real', conSesion.texto.includes(secreto));
  comprobar('no se deja cachear', (conSesion.cache || '').includes('no-store'), conSesion.cache);

  console.log('\n4. Un token inválido no vale como sesión');
  const tokenReal = token;
  token = 'no-es-un-token';
  const falso = await pedir('GET', `/archivos/${idAdjunto}`, { autenticado: true, crudo: true });
  comprobar('token basura → 401', falso.estado === 401, `estado ${falso.estado}`);
  token = tokenReal;

  console.log('\n5. La deduplicación no cruza la frontera de visibilidad');
  // Mismo contenido byte a byte que el adjunto reservado, subido por el panel
  // como documento público: no puede reutilizar la fila reservada.
  const gemelo = new FormData();
  gemelo.append('file', pdf(secreto), 'copia-publica.pdf');
  const subidoGemelo = await pedir('POST', '/archivos', { cuerpo: gemelo, autenticado: true });
  comprobar('se sube igual', subidoGemelo.estado === 201, `estado ${subidoGemelo.estado}`);
  comprobar(
    'recibe un id distinto al del adjunto reservado',
    subidoGemelo.datos.id !== idAdjunto,
    `${subidoGemelo.datos.id} vs ${idAdjunto}`,
  );
  const gemeloAnonimo = await pedir('GET', `/archivos/${subidoGemelo.datos.id}`, { crudo: true });
  comprobar('y el público sigue siendo público', gemeloAnonimo.estado === 200, `estado ${gemeloAnonimo.estado}`);
  const reservadoSigue = await pedir('GET', `/archivos/${idAdjunto}`, { crudo: true });
  comprobar('sin abrir el reservado', reservadoSigue.estado === 401, `estado ${reservadoSigue.estado}`);

  console.log('\n6. Limpieza');
  await pedir('DELETE', `/archivos/${publico.datos.id}`, { autenticado: true });
  await pedir('DELETE', `/archivos/${subidoGemelo.datos.id}`, { autenticado: true });
  const borrado = await pedir('GET', `/archivos/${publico.datos.id}`, { crudo: true });
  comprobar('los archivos de prueba se eliminaron', borrado.estado === 404, `estado ${borrado.estado}`);

  console.log(`\n${pasadas} comprobaciones correctas, ${fallidas} fallidas.`);
  console.log('Nota: el trámite de prueba queda registrado a propósito (un expediente no se borra).');
  process.exit(fallidas ? 1 : 0);
}

principal().catch((error) => {
  console.error('\nNo se pudo completar la verificación:', error.message);
  process.exit(1);
});
