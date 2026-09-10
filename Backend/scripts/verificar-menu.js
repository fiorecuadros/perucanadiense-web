/**
 * Verificación del menú autogestionable.
 *
 * El menú es lo único que se pinta en TODAS las páginas del portal: si se rompe
 * o se queda vacío, no falla una sección, falla el sitio entero. Por eso además
 * del CRUD se comprueba que el orden se respete y que "Restaurar original"
 * devuelva el menú de fábrica.
 *
 *   node scripts/verificar-menu.js [usuario] [clave]
 */
const env = require('../src/config/env');

// Por defecto el servidor local. Con API_URL se apunta a producción.
const BASE = process.env.API_URL || `http://localhost:${env.puerto}/api`;
const usuario = process.argv[2] || env.admin.usuario;
const clave = process.argv[3] || env.admin.clave;

const ZONAS = ['principal', 'acciones', 'pie-institucional', 'pie-servicios'];

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

async function principal() {
  const login = await pedir('POST', '/auth/login', { cuerpo: { username: usuario, password: clave } });
  if (!login.datos || !login.datos.token) {
    console.error('No se pudo iniciar sesión. Revise ADMIN_USUARIO / ADMIN_CLAVE.');
    process.exit(1);
  }
  token = login.datos.token;
  console.log(`Verificando el menú contra ${BASE}\n`);

  console.log('1. El portal recibe el menú sin sesión');
  const publico = await pedir('GET', '/menu');
  comprobar('GET /menu responde 200', publico.estado === 200, `estado ${publico.estado}`);
  for (const zona of ZONAS) {
    comprobar(
      `la zona "${zona}" trae enlaces`,
      Array.isArray(publico.datos[zona]) && publico.datos[zona].length > 0,
      JSON.stringify(publico.datos[zona]),
    );
  }
  const principal = publico.datos.principal || [];
  comprobar(
    'vienen ordenados',
    principal.every((item, i) => i === 0 || principal[i - 1].orden <= item.orden),
    principal.map((i) => `${i.orden}:${i.etiqueta}`).join(' '),
  );

  console.log('\n2. Añadir un enlace desde el panel');
  const creado = await pedir('POST', '/admin/menu', {
    autenticado: true,
    cuerpo: { zona: 'principal', etiqueta: 'Prueba automática', destino: '/nosotros', visible: true },
  });
  comprobar('POST crea el enlace', creado.estado === 201, `estado ${creado.estado}`);
  comprobar('recibe un id legible', /^principal-prueba/.test(creado.datos.id || ''), creado.datos.id);
  comprobar('se coloca al final de su zona', creado.datos.orden > principal.length - 1, `orden ${creado.datos.orden}`);

  const trasAlta = await pedir('GET', '/menu');
  comprobar(
    'el portal ya lo ve',
    (trasAlta.datos.principal || []).some((i) => i.id === creado.datos.id),
  );

  console.log('\n3. Un destino inválido se rechaza');
  const malo = await pedir('POST', '/admin/menu', {
    autenticado: true,
    cuerpo: { zona: 'principal', etiqueta: 'Roto', destino: 'nosotros' },
  });
  comprobar('una ruta sin barra inicial responde 422', malo.estado === 422, `estado ${malo.estado}`);
  const zonaMala = await pedir('POST', '/admin/menu', {
    autenticado: true,
    cuerpo: { zona: 'inventada', etiqueta: 'Roto', destino: '/nosotros' },
  });
  comprobar('una zona desconocida responde 422', zonaMala.estado === 422, `estado ${zonaMala.estado}`);

  console.log('\n4. Ocultar no es borrar');
  const oculto = await pedir('PUT', `/admin/menu/${creado.datos.id}`, {
    autenticado: true,
    cuerpo: { ...creado.datos, visible: false },
  });
  comprobar('PUT lo marca oculto', oculto.estado === 200 && oculto.datos.visible === false);
  const trasOcultar = await pedir('GET', '/menu');
  comprobar(
    'el portal deja de mostrarlo',
    !(trasOcultar.datos.principal || []).some((i) => i.id === creado.datos.id),
  );
  const enPanel = await pedir('GET', '/admin/menu', { autenticado: true });
  comprobar(
    'pero el panel lo sigue viendo (para reponerlo)',
    enPanel.datos.some((i) => i.id === creado.datos.id),
  );

  console.log('\n5. Reordenar');
  const dePrincipal = enPanel.datos.filter((i) => i.zona === 'principal');
  const invertido = [...dePrincipal].reverse().map((i, indice) => ({ id: i.id, orden: indice + 1 }));
  const reordenado = await pedir('PUT', '/admin/menu/orden', { autenticado: true, cuerpo: { items: invertido } });
  comprobar('PUT /admin/menu/orden responde 200', reordenado.estado === 200, `estado ${reordenado.estado}`);
  const primeroEsperado = dePrincipal[dePrincipal.length - 1].id;
  const ahoraPrimero = reordenado.datos
    .filter((i) => i.zona === 'principal')
    .sort((a, b) => a.orden - b.orden)[0];
  comprobar('el orden nuevo queda guardado', ahoraPrimero.id === primeroEsperado,
    `${ahoraPrimero.id} vs ${primeroEsperado}`);

  console.log('\n6. Sin sesión no se toca el menú');
  const sinToken = await pedir('POST', '/admin/menu', {
    cuerpo: { zona: 'principal', etiqueta: 'Anónimo', destino: '/inicio' },
  });
  comprobar('POST sin token responde 401', sinToken.estado === 401, `estado ${sinToken.estado}`);

  console.log('\n7. Restaurar original');
  const restaurado = await pedir('POST', '/admin/menu/restaurar', { autenticado: true });
  comprobar('POST /admin/menu/restaurar responde 200', restaurado.estado === 200, `estado ${restaurado.estado}`);
  comprobar(
    'el enlace de prueba desapareció',
    !restaurado.datos.some((i) => i.id === creado.datos.id),
  );
  const final = await pedir('GET', '/menu');
  for (const zona of ZONAS) {
    comprobar(
      `la zona "${zona}" volvió a su estado oficial`,
      Array.isArray(final.datos[zona]) && final.datos[zona].length > 0,
    );
  }
  const finalPrincipal = final.datos.principal || [];
  comprobar(
    'y en su orden original',
    finalPrincipal[0] && finalPrincipal[0].etiqueta === 'Inicio',
    finalPrincipal.map((i) => i.etiqueta).join(' · '),
  );

  console.log(`\n${pasadas} comprobaciones correctas, ${fallidas} fallidas.`);
  process.exit(fallidas ? 1 : 0);
}

principal().catch((error) => {
  console.error('\nNo se pudo completar la verificación:', error.message);
  process.exit(1);
});
