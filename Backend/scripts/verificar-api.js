/**
 * Verificación de extremo a extremo del bloque A.
 *
 * Recorre el contrato como lo haría el Angular: inicia sesión, edita contenido,
 * sube un archivo, publica un documento, crea noticia y personal, registra un
 * trámite y lo rastrea. Deja la base como estaba (borra lo que crea).
 *
 *   node scripts/verificar-api.js            (usa ADMIN_USUARIO/ADMIN_CLAVE del .env)
 *   node scripts/verificar-api.js usuario clave
 */
const env = require('../src/config/env');

// Por defecto el servidor local. Con API_URL se apunta a producción:
//   API_URL=https://api.pcanadiense.edu.pe/api node scripts/<script>.js
const BASE = process.env.API_URL || `http://localhost:${env.puerto}/api`;
const usuario = process.argv[2] || env.admin.usuario;
const clave = process.argv[3] || env.admin.clave;

let token = null;
let pasadas = 0;
let fallidas = 0;
const creado = { archivo: null, documento: null, noticia: null, personal: null };

function comprobar(descripcion, condicion, detalle = '') {
  if (condicion) {
    pasadas += 1;
    console.log(`  ok   ${descripcion}`);
  } else {
    fallidas += 1;
    console.log(`  FALLA ${descripcion}${detalle ? ` → ${detalle}` : ''}`);
  }
}

async function pedir(metodo, ruta, { cuerpo, autenticado = false, form } = {}) {
  const cabeceras = {};
  if (autenticado && token) cabeceras.Authorization = `Bearer ${token}`;
  if (cuerpo) cabeceras['Content-Type'] = 'application/json';

  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: form || (cuerpo ? JSON.stringify(cuerpo) : undefined),
  });

  const tipo = respuesta.headers.get('content-type') || '';
  const datos = tipo.includes('application/json')
    ? await respuesta.json().catch(() => null)
    : await respuesta.arrayBuffer().catch(() => null);
  return { estado: respuesta.status, datos, tipo };
}

/** PNG de 1×1 válido: sirve para probar la comprobación de bytes mágicos. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

async function principal() {
  console.log(`Verificando ${BASE}\n`);

  console.log('1. Salud y catálogo público');
  const salud = await pedir('GET', '/salud');
  comprobar('GET /salud responde ok', salud.estado === 200 && salud.datos.ok, `estado ${salud.estado}`);

  const nosotros = await pedir('GET', '/contenido/nosotros');
  comprobar('GET /contenido/nosotros trae la misión sembrada',
    nosotros.estado === 200 && typeof nosotros.datos.mission === 'string' && nosotros.datos.mission.length > 50,
    `estado ${nosotros.estado}`);
  const misionOriginal = nosotros.datos && nosotros.datos.heroLead;

  const programas = await pedir('GET', '/programas');
  comprobar('GET /programas devuelve la oferta', programas.estado === 200 && programas.datos.length >= 7,
    `${programas.datos && programas.datos.length} programas`);

  const institucion = await pedir('GET', '/institucion');
  comprobar('GET /institucion trae el RUC oficial', institucion.datos && institucion.datos.ruc === '20606550937');

  const chatVacio = await pedir('POST', '/asistente', { cuerpo: {} });
  comprobar('POST /asistente sin mensaje responde 422', chatVacio.estado === 422, `estado ${chatVacio.estado}`);

  const chatProg = await pedir('POST', '/asistente', { cuerpo: { mensaje: 'qué programas ofrecen' } });
  comprobar(
    'el asistente responde la oferta con enlace a /programas',
    chatProg.estado === 200
      && typeof chatProg.datos.texto === 'string'
      && Array.isArray(chatProg.datos.enlaces)
      && chatProg.datos.enlaces.some((e) => e.ruta === '/programas'),
    JSON.stringify(chatProg.datos),
  );

  const chatSunedu = await pedir('POST', '/asistente', { cuerpo: { mensaje: 'estan licenciados por sunedu' } });
  comprobar(
    'el asistente aclara que el rectorado es MINEDU',
    chatSunedu.estado === 200 && /MINEDU/i.test(chatSunedu.datos.texto),
    chatSunedu.datos && chatSunedu.datos.texto,
  );

  const chatDuracion = await pedir('POST', '/asistente', { cuerpo: { mensaje: 'cuanto dura auxiliar de educacion' } });
  comprobar(
    'la duración de una técnica no se inventa como 5 años',
    chatDuracion.estado === 200
      && /12 meses/i.test(chatDuracion.datos.texto)
      && !/10 ciclos|5 años|05 años/i.test(chatDuracion.datos.texto),
    chatDuracion.datos && chatDuracion.datos.texto,
  );

  console.log('\n2. Sesión');
  const sinToken = await pedir('PUT', '/admin/contenido/nosotros', { cuerpo: { heroTitle: 'x' } });
  comprobar('PUT admin sin token responde 401', sinToken.estado === 401, `estado ${sinToken.estado}`);

  const malaClave = await pedir('POST', '/auth/login', { cuerpo: { username: usuario, password: 'clave-incorrecta' } });
  comprobar('login con clave incorrecta responde 401', malaClave.estado === 401, `estado ${malaClave.estado}`);

  const login = await pedir('POST', '/auth/login', { cuerpo: { username: usuario, password: clave } });
  comprobar('login devuelve token y usuario', login.estado === 200 && !!login.datos.token && !!login.datos.user,
    login.datos && login.datos.message);
  if (!login.datos || !login.datos.token) {
    console.log('\nSin sesión no se puede seguir. ¿Ejecutó `npm run crear-admin`?');
    process.exit(1);
  }
  token = login.datos.token;

  const yo = await pedir('GET', '/auth/me', { autenticado: true });
  comprobar('GET /auth/me identifica la sesión', yo.estado === 200 && yo.datos.user.rol === 'admin');

  console.log('\n3. Contenido autogestionado');
  const marca = `Verificación ${new Date().toISOString()}`;
  const guardado = await pedir('PUT', '/admin/contenido/nosotros', {
    autenticado: true,
    cuerpo: { ...nosotros.datos, heroLead: marca },
  });
  comprobar('PUT contenido guarda el borrador completo', guardado.estado === 200 && guardado.datos.heroLead === marca);

  const publico = await pedir('GET', '/contenido/nosotros');
  comprobar('el sitio público ve el cambio sin sesión', publico.datos.heroLead === marca);

  const restaurado = await pedir('POST', '/admin/contenido/nosotros/restaurar', { autenticado: true });
  comprobar('restaurar devuelve el copy oficial', restaurado.estado === 200 && restaurado.datos.heroLead === misionOriginal,
    'el heroLead no volvió a la semilla');

  console.log('\n4. Archivos');
  const formulario = new FormData();
  formulario.append('file', new Blob([PNG], { type: 'image/png' }), 'prueba.png');
  const subida = await fetch(`${BASE}/archivos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formulario,
  });
  const archivo = await subida.json();
  comprobar('POST /archivos devuelve id y url', subida.status === 201 && !!archivo.id && archivo.url.startsWith('/api/archivos/'),
    JSON.stringify(archivo));
  creado.archivo = archivo.id;

  if (archivo.id) {
    const descarga = await fetch(`${BASE}/archivos/${archivo.id}`);
    comprobar('GET /archivos/:id sirve el binario sin sesión',
      descarga.status === 200 && (descarga.headers.get('content-type') || '').includes('image/png'));

    const raiz = await fetch(`http://localhost:${env.puerto}/archivos/${archivo.id}`);
    comprobar('el mismo archivo responde fuera de /api (como lo arma el frontend)', raiz.status === 200);
  }

  const falso = new FormData();
  falso.append('file', new Blob([Buffer.from('esto no es un pdf')], { type: 'application/pdf' }), 'falso.pdf');
  const rechazo = await fetch(`${BASE}/archivos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: falso,
  });
  comprobar('un PDF falso se rechaza por sus bytes', rechazo.status === 415, `estado ${rechazo.status}`);

  console.log('\n5. Documentos (borrador vs publicado)');
  const borrador = await pedir('POST', '/admin/documentos', {
    autenticado: true,
    cuerpo: {
      modulo: 'becas', seccion: 'hero', titulo: 'Documento de verificación',
      tipo: 'imagen', url: archivo.url, orden: 99, estado: 'borrador',
    },
  });
  comprobar('POST documento crea en borrador', borrador.estado === 201 && borrador.datos.estado === 'borrador');
  creado.documento = borrador.datos && borrador.datos.id;

  const publicosAntes = await pedir('GET', '/documentos?modulo=becas');
  comprobar('un borrador NO aparece en el listado público',
    !publicosAntes.datos.some((d) => d.id === creado.documento));

  await pedir('PUT', `/admin/documentos/${creado.documento}`, {
    autenticado: true,
    cuerpo: { ...borrador.datos, estado: 'publicado' },
  });
  const publicosDespues = await pedir('GET', '/documentos?modulo=becas');
  comprobar('al publicarlo sí aparece', publicosDespues.datos.some((d) => d.id === creado.documento));

  console.log('\n6. Noticias, personal y repositorio');
  const noticia = await pedir('POST', '/admin/noticias', {
    autenticado: true,
    cuerpo: {
      id: 'verificacion-automatica', title: 'Noticia de verificación', category: 'comunicado',
      excerpt: 'Alta de prueba.', paragraphs: ['Párrafo de prueba.'], image: archivo.url,
      imageAlt: 'Prueba', createdAt: new Date().toISOString().slice(0, 10), featured: false,
    },
  });
  comprobar('POST noticia devuelve el id definitivo', noticia.estado === 201 && !!noticia.datos.id);
  creado.noticia = noticia.datos && noticia.datos.id;

  const listadoNoticias = await pedir('GET', '/noticias');
  comprobar('la noticia sale en el listado público', listadoNoticias.datos.some((n) => n.id === creado.noticia));

  const persona = await pedir('POST', '/admin/personal', {
    autenticado: true,
    cuerpo: {
      type: 'Docente', names: 'Verificación', lastNames: 'Automática',
      position: 'Docente de prueba', grade: 'Magíster', email: 'prueba@pcanadiense.edu.pe',
    },
  });
  comprobar('POST personal asigna id numérico propio', persona.estado === 201 && Number.isInteger(persona.datos.id));
  creado.personal = persona.datos && persona.datos.id;

  const repositorio = await pedir('GET', '/repositorio');
  comprobar('GET /repositorio trae las tesis sembradas', repositorio.estado === 200 && repositorio.datos.length >= 4);

  console.log('\n7. Trámites');
  const tramite = await pedir('POST', '/tramites/mesa-de-partes', {
    cuerpo: {
      nombres: 'Verificación Automática', dni: '00000000', telefono: '938146082',
      correo: 'verificacion@pcanadiense.edu.pe', condicion: 'Postulante', tipoDoc: 'Solicitud',
      folios: 1, asunto: 'Prueba de verificación', mensaje: 'Registro generado por el script de verificación.',
    },
  });
  comprobar('POST mesa de partes devuelve trackingCode', tramite.estado === 201 && /^MDP-/.test(tramite.datos.trackingCode),
    JSON.stringify(tramite.datos));

  if (tramite.datos && tramite.datos.trackingCode) {
    const seguimiento = await pedir('GET', `/tramites/mesa-de-partes/${tramite.datos.trackingCode}`);
    comprobar('el seguimiento público devuelve estado y asunto',
      seguimiento.estado === 200 && seguimiento.datos.payload.asunto === 'Prueba de verificación');
    comprobar('el seguimiento NO expone el DNI ni el mensaje',
      seguimiento.datos.payload.dni === undefined && seguimiento.datos.payload.mensaje === undefined);
  }

  const invalido = await pedir('POST', '/tramites/reclamaciones', { cuerpo: { nombres: 'x' } });
  comprobar('un formulario incompleto responde 422 con detalles',
    invalido.estado === 422 && Array.isArray(invalido.datos.detalles), `estado ${invalido.estado}`);

  const reclamo = await pedir('POST', '/tramites/reclamaciones', {
    cuerpo: {
      tipoDocumento: 'DNI', numeroDocumento: '70123456', nombres: 'Verificacion',
      apellidos: 'Automatica', email: 'reclamo.verificacion@pcanadiense.edu.pe',
      telefono: '987654321', direccion: 'Av. Los Alamos 123, Chiclayo',
      tipoBien: 'Servicio', descripcionBien: 'Formacion docente del programa de Inicial',
      tipoReclamo: 'Reclamo', detalleReclamo: 'No recibí la constancia en el plazo ofrecido.',
      pedido: 'Solicito la emisión de la constancia.',
    },
  });
  comprobar('POST reclamaciones devuelve código REC-', reclamo.estado === 201 && /^REC-/.test(reclamo.datos.codigo),
    JSON.stringify(reclamo.datos));

  if (reclamo.datos && reclamo.datos.codigo) {
    const seguimientoReclamo = await pedir('GET', `/tramites/reclamaciones/${reclamo.datos.codigo}`);
    comprobar('el seguimiento del reclamo devuelve tipo de bien, no el DNI',
      seguimientoReclamo.estado === 200
        && seguimientoReclamo.datos.payload.tipoBien === 'Servicio'
        && seguimientoReclamo.datos.payload.numeroDocumento === undefined
        && seguimientoReclamo.datos.payload.email === undefined
        && seguimientoReclamo.datos.payload.detalleReclamo === undefined);

    const bandeja = await pedir('GET', '/admin/reclamaciones', { autenticado: true });
    const hoja = (bandeja.datos || []).find((t) => t.codigo === reclamo.datos.codigo);
    if (hoja) {
      const sinRespuesta = await pedir('PUT', `/admin/reclamaciones/${hoja.id}`, {
        autenticado: true,
        cuerpo: { estado: 'resuelto' },
      });
      comprobar('cerrar un reclamo sin respuesta responde 400', sinRespuesta.estado === 400);

      const cerrado = await pedir('PUT', `/admin/reclamaciones/${hoja.id}`, {
        autenticado: true,
        cuerpo: { estado: 'resuelto', respuesta: 'Se emitió la constancia.' },
      });
      comprobar('cerrar un reclamo con respuesta responde 200', cerrado.estado === 200);

      const reabrir = await pedir('PUT', `/admin/reclamaciones/${hoja.id}`, {
        autenticado: true,
        cuerpo: { estado: 'en_proceso', respuesta: 'Reapertura' },
      });
      comprobar('un reclamo resuelto no se reabre', reabrir.estado === 400, `estado ${reabrir.estado}`);
    } else {
      comprobar('el reclamo de verificación aparece en la bandeja', false);
    }
  }

  if (tramite.datos && tramite.datos.trackingCode) {
    const bandejaMesa = await pedir('GET', '/admin/mesa-de-partes', { autenticado: true });
    const mesa = (bandejaMesa.datos || []).find((t) => t.codigo === tramite.datos.trackingCode);
    if (mesa) {
      const rechazoVacio = await pedir('PUT', `/admin/mesa-de-partes/${mesa.id}`, {
        autenticado: true,
        cuerpo: { estado: 'rechazado' },
      });
      comprobar('rechazar mesa de partes sin motivo responde 400', rechazoVacio.estado === 400);
    }
  }

  console.log('\n8. Panel');
  const resumen = await pedir('GET', '/admin/panel/resumen', { autenticado: true });
  comprobar('el tablero resume documentos, trámites y actividad',
    resumen.estado === 200 && typeof resumen.datos.documentos.publicados === 'number' && Array.isArray(resumen.datos.actividad));

  console.log('\n9. Limpieza');
  if (creado.noticia) await pedir('DELETE', `/admin/noticias/${creado.noticia}`, { autenticado: true });
  if (creado.personal) await pedir('DELETE', `/admin/personal/${creado.personal}`, { autenticado: true });
  if (creado.documento) await pedir('DELETE', `/admin/documentos/${creado.documento}`, { autenticado: true });
  if (creado.archivo) await pedir('DELETE', `/archivos/${creado.archivo}?forzar=1`, { autenticado: true });
  const limpio = await pedir('GET', '/noticias');
  comprobar('la noticia de prueba se eliminó', !limpio.datos.some((n) => n.id === creado.noticia));

  console.log(`\n${pasadas} comprobaciones correctas, ${fallidas} fallidas.`);
  console.log('Nota: el trámite de prueba queda registrado a propósito (los trámites no se borran).');
  process.exit(fallidas ? 1 : 0);
}

principal().catch((error) => {
  console.error('\nNo se pudo completar la verificación:', error.message);
  console.error('¿Está el servidor levantado? (npm run dev)');
  process.exit(1);
});
