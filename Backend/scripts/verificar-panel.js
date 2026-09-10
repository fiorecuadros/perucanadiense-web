/**
 * Verificación del bloque C: los endpoints que consumen los siete paneles del
 * admin que estaban vacíos (tablero, contactos, documentos, investigaciones,
 * mesa de partes, reclamaciones, usuarios y otras solicitudes).
 *
 *   node scripts/verificar-panel.js
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

const PDF = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.from('contenido de prueba\n%%EOF\n')]);

async function principal() {
  const login = await pedir('POST', '/auth/login', { cuerpo: { username: usuario, password: clave } });
  if (!login.datos || !login.datos.token) {
    console.error('No se pudo iniciar sesión. Revise ADMIN_USUARIO / ADMIN_CLAVE.');
    process.exit(1);
  }
  token = login.datos.token;
  console.log(`Verificando los paneles contra ${BASE}\n`);

  console.log('1. Tablero (/admin/dashboard)');
  const resumen = await pedir('GET', '/admin/panel/resumen', { autenticado: true });
  comprobar('resumen con conteos y bandejas',
    resumen.estado === 200 &&
      typeof resumen.datos.noticias === 'number' &&
      typeof resumen.datos.tramitesPendientes['mesa-de-partes'] === 'number');
  comprobar('las cinco bandejas están en el resumen',
    Object.keys(resumen.datos.tramitesPendientes).length === 5,
    Object.keys(resumen.datos.tramitesPendientes).join(', '));

  console.log('\n2. Contactos e identidad (/admin/contactos)');
  const ficha = await pedir('GET', '/institucion');
  comprobar('la ficha trae contacto, sedes, redes y tarifas',
    ficha.estado === 200 && !!ficha.datos.contact && Array.isArray(ficha.datos.locations)
      && !!ficha.datos.social && !!ficha.datos.fees && Array.isArray(ficha.datos.bankAccounts));

  const telefonoOriginal = ficha.datos.contact.landline;
  const editada = await pedir('PUT', '/admin/institucion', {
    autenticado: true,
    cuerpo: { ...ficha.datos, contact: { ...ficha.datos.contact, landline: '+074 000000' } },
  });
  comprobar('PUT guarda el cambio', editada.estado === 200 && editada.datos.contact.landline === '+074 000000');

  const publica = await pedir('GET', '/institucion');
  comprobar('el portal público ve el teléfono nuevo', publica.datos.contact.landline === '+074 000000');

  await pedir('PUT', '/admin/institucion', {
    autenticado: true,
    cuerpo: { ...ficha.datos, contact: { ...ficha.datos.contact, landline: telefonoOriginal } },
  });
  const vuelta = await pedir('GET', '/institucion');
  comprobar('se restauró el teléfono oficial', vuelta.datos.contact.landline === telefonoOriginal);

  console.log('\n3. Documentos (/admin/documentos)');
  const todos = await pedir('GET', '/admin/documentos', { autenticado: true });
  comprobar('el panel ve publicados y borradores', todos.estado === 200 && todos.datos.length >= 8);

  const restaurados = await pedir('POST', '/admin/documentos/restaurar/licenciamiento', { autenticado: true });
  comprobar('restaurar un módulo repone su documento oficial',
    restaurados.estado === 200 && restaurados.datos.some((d) => d.id === 'seed-licenciamiento-rvm'),
    JSON.stringify(restaurados.datos && restaurados.datos.map((d) => d.id)));

  console.log('\n4. Investigaciones (/admin/investigaciones)');
  const tesis = await pedir('POST', '/admin/repositorio', {
    autenticado: true,
    cuerpo: {
      titulo: 'Tesis de verificación del panel',
      autores: ['Autora de Prueba', 'Coautor de Prueba'],
      programa: 'Educación Inicial',
      anio: '2026',
      tipo: 'Tesis',
      nivel: 'Educación Inicial',
      resumen: 'Registro creado por el script de verificación.',
    },
  });
  comprobar('POST crea la tesis con slug propio', tesis.estado === 201 && !!tesis.datos.id, JSON.stringify(tesis.datos));
  comprobar('los autores vuelven como arreglo', Array.isArray(tesis.datos.autores) && tesis.datos.autores.length === 2);
  comprobar('sin PDF no hay pdfUrl (el portal avisa que no está archivado)', tesis.datos.pdfUrl === undefined);

  const formulario = new FormData();
  formulario.append('file', new Blob([PDF], { type: 'application/pdf' }), 'tesis.pdf');
  const subida = await fetch(`${BASE}/admin/repositorio/${tesis.datos.id}/archivo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formulario,
  });
  const conPdf = await subida.json();
  comprobar('subir el PDF deja la ficha con pdfUrl',
    subida.status === 201 && typeof conPdf.pdfUrl === 'string' && conPdf.pdfUrl.startsWith('/api/archivos/'),
    JSON.stringify(conPdf.pdfUrl));

  const publico = await pedir('GET', '/repositorio');
  comprobar('la tesis aparece en el repositorio público', publico.datos.some((t) => t.id === tesis.datos.id));

  await pedir('DELETE', `/admin/repositorio/${tesis.datos.id}`, { autenticado: true });
  const trasBorrar = await pedir('GET', '/repositorio');
  comprobar('al eliminarla desaparece del portal', !trasBorrar.datos.some((t) => t.id === tesis.datos.id));

  console.log('\n5. Bandejas de trámites');
  const bandejas = [
    ['mesa-de-partes', '/admin/mesa-de-partes'],
    ['reclamaciones', '/admin/reclamaciones'],
    ['acceso-informacion', '/admin/acceso-informacion'],
    ['citas-psicopedagogicas', '/admin/citas-psicopedagogicas'],
    ['servicio-social', '/admin/servicio-social'],
  ];
  for (const [nombre, ruta] of bandejas) {
    const bandeja = await pedir('GET', ruta, { autenticado: true });
    comprobar(`GET ${nombre} responde una lista`, bandeja.estado === 200 && Array.isArray(bandeja.datos),
      `estado ${bandeja.estado}`);
  }

  const mesa = await pedir('GET', '/admin/mesa-de-partes', { autenticado: true });
  if (mesa.datos.length) {
    const primero = mesa.datos[0];
    comprobar('el panel sí ve los datos completos del solicitante',
      !!primero.payload.dni && !!primero.payload.mensaje);

    const cambiado = await pedir('PUT', `/admin/mesa-de-partes/${primero.id}`, {
      autenticado: true,
      cuerpo: { estado: 'en_tramite', respuesta: 'Derivado a Secretaría Académica.' },
    });
    comprobar('cambiar el estado queda guardado',
      cambiado.estado === 200 && cambiado.datos.estado === 'en_tramite' && !!cambiado.datos.respuesta);

    const seguimiento = await pedir('GET', `/tramites/mesa-de-partes/${primero.codigo}`);
    comprobar('el ciudadano ve el estado nuevo al consultar su código',
      seguimiento.datos.status === 'en_tramite');

    const invalido = await pedir('PUT', `/admin/mesa-de-partes/${primero.id}`, {
      autenticado: true,
      cuerpo: { estado: 'inventado' },
    });
    comprobar('un estado inexistente se rechaza', invalido.estado === 400, `estado ${invalido.estado}`);
  } else {
    console.log('  (sin trámites registrados: se omite la prueba de cambio de estado)');
  }

  console.log('\n6. Usuarios (/admin/usuarios)');
  const nuevo = await pedir('POST', '/admin/usuarios', {
    autenticado: true,
    cuerpo: {
      nombre: 'Editora de Verificación',
      username: `verificacion.${Date.now().toString(36)}`,
      email: null,
      rol: 'editor',
      activo: true,
      password: 'clave-de-prueba-2026',
    },
  });
  comprobar('POST crea la cuenta sin devolver el hash',
    nuevo.estado === 201 && !!nuevo.datos.id && nuevo.datos.password === undefined,
    JSON.stringify(nuevo.datos));

  const claveCorta = await pedir('POST', '/admin/usuarios', {
    autenticado: true,
    cuerpo: { nombre: 'X', username: 'x.corto', rol: 'editor', activo: true, password: '123' },
  });
  comprobar('una contraseña corta se rechaza con 422', claveCorta.estado === 422, `estado ${claveCorta.estado}`);

  const sesionEditor = await pedir('POST', '/auth/login', {
    cuerpo: { username: nuevo.datos.username, password: 'clave-de-prueba-2026' },
  });
  comprobar('la cuenta nueva puede iniciar sesión', sesionEditor.estado === 200 && !!sesionEditor.datos.token);

  const tokenAdmin = token;
  token = sesionEditor.datos.token;
  const editorEnUsuarios = await pedir('GET', '/admin/usuarios', { autenticado: true });
  comprobar('un editor NO puede gestionar cuentas (403)', editorEnUsuarios.estado === 403,
    `estado ${editorEnUsuarios.estado}`);
  const editorEnContenido = await pedir('GET', '/admin/documentos', { autenticado: true });
  comprobar('pero sí gestiona contenido', editorEnContenido.estado === 200);
  token = tokenAdmin;

  await pedir('DELETE', `/admin/usuarios/${nuevo.datos.id}`, { autenticado: true });
  const lista = await pedir('GET', '/admin/usuarios', { autenticado: true });
  comprobar('la cuenta de prueba se eliminó', !lista.datos.some((u) => u.id === nuevo.datos.id));

  const yoMismo = lista.datos.find((u) => u.username === usuario);
  const autoborrado = await pedir('DELETE', `/admin/usuarios/${yoMismo.id}`, { autenticado: true });
  comprobar('no se puede borrar la propia cuenta', autoborrado.estado === 400, `estado ${autoborrado.estado}`);

  console.log('\n7. Mi cuenta (/admin/mi-cuenta)');
  // Gestionar cuentas es solo de admin: sin un endpoint propio, un editor no
  // podría cambiar nunca la contraseña que le dieron.
  const cuenta = { nombre: 'Cuenta de prueba', username: `pw_${Date.now()}`, password: 'clave-inicial-1', rol: 'editor' };
  const creada = await pedir('POST', '/admin/usuarios', { cuerpo: cuenta, autenticado: true });
  const sesionCuenta = await pedir('POST', '/auth/login', {
    cuerpo: { username: cuenta.username, password: cuenta.password },
  });
  const tokenAdmin2 = token;
  token = sesionCuenta.datos.token;

  const malActual = await pedir('PUT', '/auth/password', {
    autenticado: true,
    cuerpo: { actual: 'no-es-la-suya', nueva: 'clave-nueva-1' },
  });
  comprobar('con la contraseña actual mal responde 401', malActual.estado === 401, `estado ${malActual.estado}`);

  const corta = await pedir('PUT', '/auth/password', {
    autenticado: true,
    cuerpo: { actual: cuenta.password, nueva: 'corta' },
  });
  comprobar('una contraseña corta se rechaza con 422', corta.estado === 422, `estado ${corta.estado}`);

  const cambio = await pedir('PUT', '/auth/password', {
    autenticado: true,
    cuerpo: { actual: cuenta.password, nueva: 'clave-nueva-1' },
  });
  comprobar('un editor SÍ puede cambiar su propia contraseña', cambio.estado === 200, `estado ${cambio.estado}`);

  const vieja = await pedir('POST', '/auth/login', {
    cuerpo: { username: cuenta.username, password: cuenta.password },
  });
  comprobar('la contraseña anterior deja de servir', vieja.estado === 401, `estado ${vieja.estado}`);
  const nueva = await pedir('POST', '/auth/login', {
    cuerpo: { username: cuenta.username, password: 'clave-nueva-1' },
  });
  comprobar('la nueva sí sirve', nueva.estado === 200, `estado ${nueva.estado}`);

  token = tokenAdmin2;
  await pedir('DELETE', `/admin/usuarios/${creada.datos.id}`, { autenticado: true });

  console.log(`\n${pasadas} comprobaciones correctas, ${fallidas} fallidas.`);
  process.exit(fallidas ? 1 : 0);
}

principal().catch((error) => {
  console.error('\nNo se pudo completar la verificación:', error.message);
  process.exit(1);
});
