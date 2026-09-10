/**
 * Verificación del aviso al solicitante: responder un trámite desde el panel
 * tiene que llegarle al ciudadano por correo, y solo cuando quien atiende lo
 * pide. Una observación interna no debe salir del instituto.
 *
 * Necesita un servidor SMTP de pruebas con API de lectura (Mailpit):
 *
 *   podman run -d --name mailpit-vdc -p 1025:1025 -p 8025:8025 axllent/mailpit
 *   MAIL_HABILITADO=true en el .env
 *   node scripts/verificar-avisos.js
 */
const env = require('../src/config/env');

// Por defecto el servidor local. Con API_URL se apunta a producción:
//   API_URL=https://api.pcanadiense.edu.pe/api node scripts/<script>.js
const BASE = process.env.API_URL || `http://localhost:${env.puerto}/api`;
const MAILPIT = process.env.MAILPIT_URL || 'http://localhost:8025/api/v1';
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

async function pedir(metodo, ruta, { cuerpo, autenticado = false } = {}) {
  const cabeceras = {};
  if (autenticado && token) cabeceras.Authorization = `Bearer ${token}`;
  if (cuerpo) cabeceras['Content-Type'] = 'application/json';
  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
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

const vaciarBuzon = () => fetch(`${MAILPIT}/messages`, { method: 'DELETE' });

/** El envío es posterior a la respuesta HTTP: hay que darle un margen al SMTP. */
async function buzon(espera = 800) {
  await new Promise((resolver) => setTimeout(resolver, espera));
  const respuesta = await fetch(`${MAILPIT}/messages`);
  return (await respuesta.json()).messages;
}

const paraUno = (mensajes, direccion) =>
  mensajes.find((m) => m.To.some((destino) => destino.Address === direccion));

async function cuerpoDe(mensaje) {
  const respuesta = await fetch(`${MAILPIT}/message/${mensaje.ID}`);
  return (await respuesta.json()).HTML;
}

/**
 * Un trámite completo: alta pública, respuesta interna sin aviso y respuesta
 * notificada. Mesa de partes guarda el correo en `correo` y los otros cuatro
 * en `email`; si esa clave se equivoca, el aviso se manda al vacío.
 */
async function recorrerBandeja({ titulo, ruta, bandeja, alta, correo, nombre, estados }) {
  console.log(`\n${titulo}`);

  await vaciarBuzon();
  const creado = await pedir('POST', ruta, { cuerpo: alta });
  if (abortarSiLimitado(creado)) process.exit(2);
  comprobar('el ciudadano registra su solicitud', creado.estado === 201, `estado ${creado.estado}`);
  const codigo = creado.datos && (creado.datos.codigo || creado.datos.trackingCode);
  comprobar('devuelve código de seguimiento', !!codigo, JSON.stringify(creado.datos));
  if (!codigo) return;

  comprobar('recibe el acuse de recibo', !!paraUno(await buzon(), correo));

  const lista = await pedir('GET', bandeja, { autenticado: true });
  const registro = (lista.datos || []).find((t) => t.codigo === codigo);
  comprobar('la solicitud aparece en la bandeja del panel', !!registro);
  if (!registro) return;

  // Sin la casilla: queda en el expediente y nadie molesta al ciudadano.
  await vaciarBuzon();
  const interno = await pedir('PUT', `${bandeja}/${registro.id}`, {
    autenticado: true,
    cuerpo: { estado: estados.intermedio, respuesta: 'Nota interna de seguimiento.' },
  });
  comprobar('guardar sin notificar responde 200', interno.estado === 200, `estado ${interno.estado}`);
  comprobar('la respuesta indica notificado=false', interno.datos.notificado === false);
  comprobar('no sale ningún correo', (await buzon()).length === 0);

  // Con la casilla: el ciudadano recibe la respuesta escrita en el panel.
  await vaciarBuzon();
  const texto = 'Su solicitud fue atendida. Puede acercarse a Secretaría Académica.';
  const avisado = await pedir('PUT', `${bandeja}/${registro.id}`, {
    autenticado: true,
    cuerpo: { estado: estados.final, respuesta: texto, notificar: true },
  });
  comprobar('guardar notificando responde 200', avisado.estado === 200, `estado ${avisado.estado}`);
  comprobar('la respuesta indica notificado=true', avisado.datos.notificado === true);

  const aviso = paraUno(await buzon(), correo);
  comprobar('el solicitante recibe el correo de respuesta', !!aviso);
  if (!aviso) return;

  comprobar('el asunto lleva el código', aviso.Subject.includes(codigo), aviso.Subject);
  const html = await cuerpoDe(aviso);
  comprobar('el cuerpo trae la respuesta escrita en el panel', html.includes(texto));
  comprobar('saluda al solicitante por su nombre', html.includes(nombre));
  comprobar('informa el estado nuevo', html.includes(estados.final.replace(/_/g, ' ')));

  // El texto lo escribe una persona en un textarea: en un correo HTML no puede
  // llegar crudo.
  await vaciarBuzon();
  await pedir('PUT', `${bandeja}/${registro.id}`, {
    autenticado: true,
    cuerpo: { estado: estados.final, respuesta: '<script>alert(1)</script> Caso cerrado.', notificar: true },
  });
  const conEtiqueta = paraUno(await buzon(), correo);
  comprobar('la etiqueta <script> sale escapada', !!conEtiqueta && !(await cuerpoDe(conEtiqueta)).includes('<script>'));

  const reabrir = await pedir('PUT', `${bandeja}/${registro.id}`, {
    autenticado: true,
    cuerpo: { estado: estados.intermedio, respuesta: 'Intento de reapertura.' },
  });
  comprobar('un expediente cerrado no se reabre', reabrir.estado === 400, `estado ${reabrir.estado}`);
}

async function principal() {
  if (!env.correo.habilitado) {
    console.error('MAIL_HABILITADO está en false: active el correo en el .env antes de verificar los avisos.');
    process.exit(1);
  }

  try {
    await fetch(`${MAILPIT}/messages`);
  } catch {
    console.error(`No responde el buzón de pruebas en ${MAILPIT}. ¿Está corriendo Mailpit?`);
    process.exit(1);
  }

  const login = await pedir('POST', '/auth/login', { cuerpo: { username: usuario, password: clave } });
  if (!login.datos || !login.datos.token) {
    console.error('No se pudo iniciar sesión. Revise ADMIN_USUARIO / ADMIN_CLAVE.');
    process.exit(1);
  }
  token = login.datos.token;
  console.log(`Verificando los avisos al solicitante contra ${BASE}`);

  const sello = Date.now();
  const correoReclamo = `reclamo.prueba.${sello}@example.com`;
  const correoMesa = `mesa.prueba.${sello}@example.com`;

  await recorrerBandeja({
    titulo: '1. Libro de reclamaciones',
    ruta: '/tramites/reclamaciones',
    bandeja: '/admin/reclamaciones',
    correo: correoReclamo,
    nombre: 'Rosa',
    estados: { intermedio: 'en_proceso', final: 'resuelto' },
    alta: {
      tipoDocumento: 'DNI',
      numeroDocumento: '70123456',
      nombres: 'Rosa',
      apellidos: 'Quispe Mamani',
      email: correoReclamo,
      telefono: '987654321',
      direccion: 'Av. Los Álamos 123',
      tipoReclamo: 'Reclamo',
      tipoBien: 'Servicio',
      descripcionBien: 'Constancia de estudios del periodo 2024-II.',
      detalleReclamo: 'No recibí la constancia de estudios en el plazo ofrecido.',
      pedido: 'Solicito la emisión de la constancia.',
    },
  });

  await recorrerBandeja({
    titulo: '2. Mesa de partes (el correo vive en `correo`, no en `email`)',
    ruta: '/tramites/mesa-de-partes',
    bandeja: '/admin/mesa-de-partes',
    correo: correoMesa,
    nombre: 'Julio',
    estados: { intermedio: 'en_tramite', final: 'finalizado' },
    alta: {
      nombres: 'Julio Ramos Ticona',
      dni: '70998877',
      telefono: '912345678',
      correo: correoMesa,
      condicion: 'Egresado',
      tipoDoc: 'Solicitud',
      folios: 2,
      asunto: 'Solicitud de certificado de estudios',
      mensaje: 'Solicito el certificado correspondiente al periodo 2024-II.',
      fileName: 'solicitud.pdf',
    },
  });

  console.log(`\n${pasadas} comprobaciones correctas, ${fallidas} fallidas.`);
  console.log('Nota: los trámites de prueba quedan registrados a propósito (un expediente no se borra).');
  process.exit(fallidas ? 1 : 0);
}

principal().catch((error) => {
  console.error('\nNo se pudo completar la verificación:', error.message);
  process.exit(1);
});
