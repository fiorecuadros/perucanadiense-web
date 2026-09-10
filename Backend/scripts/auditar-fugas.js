/**
 * Auditoría de fuga de datos personales.
 *
 * Saca de la base los datos personales que hay realmente almacenados (DNI,
 * correos, teléfonos, direcciones, el texto de los trámites) y comprueba que
 * ninguno aparece en ninguna respuesta pública. No busca patrones inventados:
 * busca los datos concretos de las personas que usaron el portal.
 *
 *   node scripts/auditar-fugas.js
 */
const env = require('../src/config/env');
const { consultar, pool } = require('../src/config/db');

const BASE = `http://localhost:${env.puerto}/api`;

let pasadas = 0;
let fallidas = 0;

function comprobar(descripcion, condicion, detalle = '') {
  if (condicion) {
    pasadas += 1;
    console.log(`  ok   ${descripcion}`);
  } else {
    fallidas += 1;
    console.log(`  FUGA ${descripcion}${detalle ? ` → ${detalle}` : ''}`);
  }
}

/**
 * Valores que identifican a una persona. Se descartan los muy cortos y los
 * genéricos: buscar "Ana" dentro de un HTML da falsos positivos sin fin.
 */
async function datosPersonales() {
  const consultas = [
    ['mesa de partes', 'SELECT dni, correo, telefono, nombres, mensaje, asunto FROM tramites_mesa_partes'],
    [
      'reclamaciones',
      'SELECT numero_documento AS dni, email AS correo, telefono, nombres, apellidos, direccion, detalle_reclamo AS mensaje, pedido FROM tramites_reclamaciones',
    ],
    [
      'acceso a información',
      'SELECT dni, email AS correo, telefono, nombres, direccion, informacion_solicitada AS mensaje FROM tramites_acceso_informacion',
    ],
    ['citas psicopedagógicas', 'SELECT dni, email AS correo, telefono, nombres, motivo AS mensaje FROM citas_psicopedagogicas'],
    ['apoyo social', 'SELECT dni, email AS correo, telefono, nombres, descripcion_situacion AS mensaje FROM apoyo_social'],
  ];

  const valores = new Map(); // valor → de dónde salió
  for (const [origen, sql] of consultas) {
    for (const fila of await consultar(sql)) {
      for (const [campo, valor] of Object.entries(fila)) {
        const texto = String(valor ?? '').trim();
        // El asunto y el nombre pueden ser genéricos; el DNI, el correo, el
        // teléfono y el cuerpo del trámite no lo son nunca.
        if (texto.length < 8) continue;
        valores.set(texto, `${origen}.${campo}`);
      }
    }
  }
  return valores;
}

/**
 * Datos de contacto que el instituto publica a propósito (su WhatsApp, sus
 * correos). Si un ciudadano escribe el WhatsApp del instituto en su trámite,
 * encontrarlo en /institucion no es una fuga: ya estaba publicado.
 */
async function publicadosAProposito() {
  const publicos = new Set();
  const recoger = (valor) => {
    if (typeof valor === 'string' && valor.trim().length >= 8) publicos.add(valor.trim());
    else if (valor && typeof valor === 'object') Object.values(valor).forEach(recoger);
  };
  try {
    recoger(await (await fetch(`${BASE}/institucion`)).json());
  } catch {
    // Sin ficha institucional no hay nada que excluir.
  }
  return publicos;
}

/** Todo lo que responde el API sin ninguna credencial. */
async function respuestasPublicas() {
  const modulos = [
    'inicio', 'nosotros', 'admision', 'becas', 'costos', 'estadisticas', 'horarios',
    'inversiones', 'licenciamiento', 'servicios', 'transparencia', 'reglamentos',
    'procedimientos', 'psicopedagogico', 'servicio-social', 'soporte-medico',
    'reclamaciones', 'privacidad', 'repositorio-copy',
  ];

  const rutas = [
    '/salud',
    '/documentos',
    '/institucion',
    '/noticias',
    '/personal',
    '/programas',
    '/repositorio',
    ...modulos.map((m) => `/contenido/${m}`),
  ];

  // El seguimiento público es la ruta que más cerca pasa de los datos del
  // solicitante. Tiene su propio limitador (30 por 15 min): se toma una muestra
  // en vez de recorrerlos todos, que agotaría la cuota y devolvería 429 en
  // lugar de la respuesta que se quiere auditar.
  for (const fila of await consultar('SELECT codigo FROM tramites_mesa_partes ORDER BY creado_en DESC LIMIT 5')) {
    rutas.push(`/tramites/mesa-de-partes/${fila.codigo}`);
  }
  for (const fila of await consultar('SELECT codigo FROM tramites_reclamaciones ORDER BY creado_en DESC LIMIT 5')) {
    rutas.push(`/tramites/reclamaciones/${fila.codigo}`);
  }

  const respuestas = [];
  for (const ruta of rutas) {
    try {
      const respuesta = await fetch(`${BASE}${ruta}`);
      respuestas.push({ ruta, estado: respuesta.status, texto: await respuesta.text() });
    } catch (error) {
      respuestas.push({ ruta, estado: 0, texto: '', error: error.message });
    }
  }
  return respuestas;
}

async function principal() {
  console.log(`Auditando fugas de datos personales en ${BASE}\n`);

  const personales = await datosPersonales();
  if (!personales.size) {
    console.error('No hay trámites en la base: siembre alguno antes de auditar.');
    process.exit(1);
  }
  console.log(`1. Datos personales almacenados: ${personales.size} valores distintos`);
  console.log(`   (DNI, correos, teléfonos, direcciones y textos de ${'los cinco trámites'})\n`);

  const respuestas = await respuestasPublicas();
  console.log(`2. Respuestas públicas recogidas: ${respuestas.length} rutas`);
  const caidas = respuestas.filter((r) => r.estado === 0);
  comprobar('todas las rutas respondieron', caidas.length === 0, caidas.map((r) => r.ruta).join(', '));

  console.log('\n3. ¿Aparece algún dato personal en alguna respuesta pública?');
  const publicos = await publicadosAProposito();

  // El seguimiento devuelve a propósito el nombre y el asunto: es como el
  // ciudadano confirma que el código es el suyo. Está acotado por un código de
  // 32^9 con azar criptográfico y 30 consultas por cuarto de hora, así que no
  // se puede enumerar. Se audita aparte, campo a campo, en el paso 4.
  const esSeguimiento = (ruta) => ruta.startsWith('/tramites/');
  const deliberado = new Set(['nombres', 'asunto', 'condicion', 'tipoDoc', 'folios']);

  const fugas = [];
  for (const { ruta, texto } of respuestas) {
    if (!texto) continue;
    for (const [valor, origen] of personales) {
      if (!texto.includes(valor)) continue;
      if (publicos.has(valor)) continue; // el instituto ya lo publica
      if (esSeguimiento(ruta) && deliberado.has(origen.split('.').pop())) continue;
      fugas.push({ ruta, origen, valor });
    }
  }

  comprobar(
    'ninguna respuesta pública contiene datos personales',
    fugas.length === 0,
    fugas.map((f) => `${f.ruta} expone ${f.origen}`).join(' · '),
  );
  for (const fuga of fugas) {
    console.log(`         ${fuga.ruta} ← ${fuga.origen}: "${String(fuga.valor).slice(0, 60)}"`);
  }
  console.log(`         (${publicos.size} valores excluidos: los que el instituto publica en su ficha)`);

  console.log('\n4. El seguimiento público muestra lo justo');
  const codigos = await consultar('SELECT codigo FROM tramites_mesa_partes ORDER BY creado_en DESC LIMIT 1');
  if (codigos.length) {
    const respuesta = await fetch(`${BASE}/tramites/mesa-de-partes/${codigos[0].codigo}`);
    if (respuesta.status === 429) {
      console.log('  aviso el limitador de seguimiento cortó la consulta (30 por 15 min).');
      console.log('        Reinicie el API para vaciar el contador y repita la auditoría.');
      await pool.end();
      process.exit(2);
    }
    const datos = await respuesta.json();
    const carga = datos.payload || {};
    comprobar('devuelve el estado del trámite', !!datos.status);
    console.log('        (expone a propósito nombre, condición, tipo y asunto: es como el');
    console.log('         ciudadano confirma que el código es suyo)');
    comprobar('NO devuelve el DNI', !('dni' in carga));
    comprobar('NO devuelve el correo', !('correo' in carga));
    comprobar('NO devuelve el teléfono', !('telefono' in carga));
    comprobar('NO devuelve el mensaje completo', !('mensaje' in carga));
    comprobar('NO devuelve la URL del adjunto', !('archivoUrl' in carga));
  }

  const reclamos = await consultar('SELECT codigo FROM tramites_reclamaciones ORDER BY creado_en DESC LIMIT 1');
  if (reclamos.length) {
    const respuesta = await fetch(`${BASE}/tramites/reclamaciones/${reclamos[0].codigo}`);
    if (respuesta.status === 429) {
      console.log('  aviso el limitador de seguimiento cortó la consulta (30 por 15 min).');
      console.log('        Reinicie el API para vaciar el contador y repita la auditoría.');
      await pool.end();
      process.exit(2);
    }
    const datos = await respuesta.json();
    const carga = datos.payload || {};
    comprobar('el seguimiento del reclamo devuelve estado', !!datos.status);
    comprobar('NO devuelve el número de documento', !('numeroDocumento' in carga));
    comprobar('NO devuelve el correo del reclamante', !('email' in carga));
    comprobar('NO devuelve el teléfono del reclamante', !('telefono' in carga));
    comprobar('NO devuelve la dirección', !('direccion' in carga));
    comprobar('NO devuelve el detalle ni el pedido', !('detalleReclamo' in carga) && !('pedido' in carga));
  }

  console.log('\n5. Los errores no filtran interioridades');
  const inexistente = await fetch(`${BASE}/tramites/mesa-de-partes/MDP-NOEXISTE`);
  const cuerpoError = await inexistente.text();
  comprobar('un código inexistente responde 404', inexistente.status === 404, `estado ${inexistente.status}`);
  comprobar(
    'sin volcado de SQL ni rutas del servidor',
    !/SELECT |FROM |\/home\/|at Object\.|node_modules/.test(cuerpoError),
    cuerpoError.slice(0, 120),
  );

  await pool.end();
  console.log(`\n${pasadas} comprobaciones correctas, ${fallidas} fuga(s).`);
  process.exit(fallidas ? 1 : 0);
}

principal().catch(async (error) => {
  console.error('\nNo se pudo completar la auditoría:', error.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
