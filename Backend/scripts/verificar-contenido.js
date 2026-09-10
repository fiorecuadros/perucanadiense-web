/**
 * Recorre los 19 módulos de contenido, el historial de versiones y el CRUD de
 * programas. Debe pasar con el API levantado y las semillas cargadas.
 *
 *   node scripts/verificar-contenido.js
 */
const env = require('../src/config/env');

// Por defecto el servidor local. Con API_URL se apunta a producción:
//   API_URL=https://api.pcanadiense.edu.pe/api node scripts/<script>.js
const BASE = process.env.API_URL || `http://localhost:${env.puerto}/api`;
const usuario = process.argv[2] || env.admin.usuario;
const clave = process.argv[3] || env.admin.clave;

const MODULOS = [
  'inicio',
  'nosotros',
  'admision',
  'becas',
  'costos',
  'estadisticas',
  'horarios',
  'inversiones',
  'licenciamiento',
  'servicios',
  'transparencia',
  'reglamentos',
  'procedimientos',
  'psicopedagogico',
  'servicio-social',
  'soporte-medico',
  'reclamaciones',
  'privacidad',
  'repositorio-copy',
];

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
  const tipo = respuesta.headers.get('content-type') || '';
  const datos = tipo.includes('application/json')
    ? await respuesta.json().catch(() => null)
    : await respuesta.text().catch(() => null);
  return { estado: respuesta.status, datos };
}

function campoTexto(data) {
  if (data && typeof data.heroTitle === 'string') return 'heroTitle';
  if (data && typeof data.heroLead === 'string') return 'heroLead';
  const clave = data && Object.keys(data).find((k) => typeof data[k] === 'string');
  return clave || 'heroTitle';
}

async function principal() {
  const login = await pedir('POST', '/auth/login', { cuerpo: { username: usuario, password: clave } });
  if (!login.datos || !login.datos.token) {
    console.error('No se pudo iniciar sesión. Revise ADMIN_USUARIO / ADMIN_CLAVE.');
    process.exit(1);
  }
  token = login.datos.token;
  console.log(`Verificando contenido contra ${BASE}\n`);

  console.log('1. Módulos (GET público, PUT, público ve el cambio, restaurar, historial)');
  for (const modulo of MODULOS) {
    const original = await pedir('GET', `/contenido/${modulo}`);
    comprobar(`GET /contenido/${modulo} responde objeto`, original.estado === 200 && original.datos && typeof original.datos === 'object');
    if (!original.datos) continue;

    const campo = campoTexto(original.datos);
    const valorOriginal = original.datos[campo];
    const marca = `Verif ${modulo} ${Date.now()}`;

    const guardado = await pedir('PUT', `/admin/contenido/${modulo}`, {
      autenticado: true,
      cuerpo: { ...original.datos, [campo]: marca },
    });
    comprobar(`PUT ${modulo} guarda el cambio`, guardado.estado === 200 && guardado.datos && guardado.datos[campo] === marca);

    const publico = await pedir('GET', `/contenido/${modulo}`);
    comprobar(`el público ve ${modulo} cambiado`, publico.datos && publico.datos[campo] === marca);

    const hist = await pedir('GET', `/admin/contenido/${modulo}/versiones`, { autenticado: true });
    comprobar(`historial de ${modulo} lista versiones`, hist.estado === 200 && Array.isArray(hist.datos) && hist.datos.length >= 1);

    const restaurado = await pedir('POST', `/admin/contenido/${modulo}/restaurar`, { autenticado: true });
    comprobar(`restaurar ${modulo} vuelve a la semilla`, restaurado.estado === 200 && restaurado.datos[campo] === valorOriginal);

    const despues = await pedir('GET', `/contenido/${modulo}`);
    comprobar(`el público ve ${modulo} restaurado`, despues.datos && despues.datos[campo] === valorOriginal);
  }

  console.log('\n2. Reponer una versión del historial');
  const nosotros = await pedir('GET', '/contenido/nosotros');
  const lead0 = nosotros.datos.heroLead;
  const marcaH = `Historial ${Date.now()}`;
  await pedir('PUT', '/admin/contenido/nosotros', {
    autenticado: true,
    cuerpo: { ...nosotros.datos, heroLead: marcaH },
  });
  const versiones = await pedir('GET', '/admin/contenido/nosotros/versiones', { autenticado: true });
  const previa = versiones.datos && versiones.datos[0];
  comprobar('hay una versión reciente de nosotros', !!previa && previa.id);

  if (previa) {
    const detalle = await pedir('GET', `/admin/contenido/nosotros/versiones/${previa.id}`, { autenticado: true });
    comprobar('la versión trae el JSON anterior', detalle.estado === 200 && detalle.datos && detalle.datos.data);
    const reponer = await pedir('POST', `/admin/contenido/nosotros/versiones/${previa.id}/restaurar`, {
      autenticado: true,
    });
    comprobar('reponer versión restaura el lead anterior', reponer.estado === 200 && reponer.datos.heroLead === lead0);
    await pedir('POST', '/admin/contenido/nosotros/restaurar', { autenticado: true });
  }

  console.log('\n3. Programas de estudio');
  const programas = await pedir('GET', '/programas');
  comprobar('GET /programas trae la oferta', programas.estado === 200 && Array.isArray(programas.datos) && programas.datos.length >= 1);
  const inicial = programas.datos && programas.datos.find((p) => p.id === 'educacion-inicial');
  comprobar('Educación Inicial está en el catálogo', !!inicial);

  if (inicial) {
    const vacantes0 = inicial.vacancies;
    const editado = await pedir('PUT', `/admin/programas/${inicial.id}`, {
      autenticado: true,
      cuerpo: { ...inicial, vacancies: vacantes0 + 1 },
    });
    comprobar('PUT /admin/programas cambia vacantes', editado.estado === 200 && editado.datos.vacancies === vacantes0 + 1);
    const visto = await pedir('GET', '/programas');
    const actual = visto.datos.find((p) => p.id === inicial.id);
    comprobar('el portal público ve las vacantes nuevas', actual && actual.vacancies === vacantes0 + 1);
    await pedir('PUT', `/admin/programas/${inicial.id}`, {
      autenticado: true,
      cuerpo: { ...inicial, vacancies: vacantes0 },
    });
  }

  const sinToken = await pedir('POST', '/admin/programas', { cuerpo: { title: 'x', level: 'FID' } });
  comprobar('POST /admin/programas sin token responde 401', sinToken.estado === 401);

  console.log('\n4. Borrador de noticias');
  const borrador = await pedir('POST', '/admin/noticias', {
    autenticado: true,
    cuerpo: {
      title: 'Borrador de verificación',
      category: 'noticia',
      excerpt: 'No debe salir en el listado público.',
      paragraphs: ['Párrafo de prueba del borrador.'],
      createdAt: '2026-09-02',
      publicada: false,
    },
  });
  comprobar('POST noticia en borrador', borrador.estado === 201 && borrador.datos && borrador.datos.publicada === false);
  const idBorrador = borrador.datos && borrador.datos.id;
  if (idBorrador) {
    const publicas = await pedir('GET', '/noticias');
    comprobar('el GET público no lista el borrador', Array.isArray(publicas.datos) && !publicas.datos.some((n) => n.id === idBorrador));
    const admin = await pedir('GET', '/admin/noticias', { autenticado: true });
    comprobar('GET /admin/noticias sí lista el borrador', Array.isArray(admin.datos) && admin.datos.some((n) => n.id === idBorrador));
    const oculta = await pedir('GET', `/noticias/${idBorrador}`);
    comprobar('GET público del borrador responde 404', oculta.estado === 404);
    await pedir('DELETE', `/admin/noticias/${idBorrador}`, { autenticado: true });
  }

  console.log(`\n${pasadas} ok · ${fallidas} fallas`);
  process.exit(fallidas ? 1 : 0);
}

principal().catch((error) => {
  console.error(error);
  process.exit(1);
});
