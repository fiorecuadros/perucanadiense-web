const crypto = require('crypto');
const repo = require('./tramites.repo');
const { TIPOS } = require('./tramites.tipos');
const { generarCodigo } = require('../../lib/codigos');
const { aIso, aFechaCorta } = require('../../lib/fechas');
const { leerJson } = require('../../lib/json');
const { consultarUna } = require('../../config/db');
const { noEncontrado, solicitudInvalida } = require('../../lib/errores');
const { enviar } = require('../../lib/mailer');
const env = require('../../config/env');
const {
  acuseMesa,
  avisoMesa,
  acuseReclamo,
  avisoReclamo,
  respuestaTramite,
  textoPlano,
} = require('../../lib/plantillas/tramites');

/** Convierte el payload validado en fila, según el mapa de columnas del tipo. */
function aFila(tipo, datos) {
  const fila = {};
  for (const [clave, columna] of Object.entries(tipo.columnas)) {
    const valor = datos[clave];
    fila[columna] = valor === undefined || valor === '' ? null : valor;
  }
  return fila;
}

/** Fila → payload con las claves que espera el frontend. */
function aPayload(tipo, fila) {
  const payload = {};
  for (const [clave, columna] of Object.entries(tipo.columnas)) {
    const valor = fila[columna];
    if (valor === null || valor === undefined) continue;
    payload[clave] = columna === 'fecha_preferida' ? aFechaCorta(valor) : valor;
  }
  return payload;
}

/** Registro completo, para el panel. */
function aRegistroAdmin(tipo, fila) {
  const payload = aPayload(tipo, fila);
  // El adjunto de mesa de partes: sin esta URL el panel vería el nombre del
  // archivo pero no podría abrirlo.
  if (fila.archivo_id) payload.archivoUrl = `/api/archivos/${fila.archivo_id}`;
  return {
    id: fila.id,
    trackingCode: fila.codigo,
    codigo: fila.codigo,
    submittedAt: aIso(fila.creado_en),
    actualizadoEn: aIso(fila.actualizado_en),
    status: fila.estado,
    estado: fila.estado,
    respuesta: fila[tipo.campoRespuesta] || null,
    payload,
  };
}

async function registrar(tipo, datos, contexto = {}) {
  const id = crypto.randomUUID();
  const codigo = generarCodigo(tipo.prefijo);
  const fila = {
    id,
    codigo,
    ...aFila(tipo, datos),
    ip: contexto.ip ? String(contexto.ip).slice(0, 45) : null,
    user_agent: contexto.userAgent ? String(contexto.userAgent).slice(0, 255) : null,
  };
  if (contexto.archivoId) fila.archivo_id = contexto.archivoId;

  await repo.insertar(tipo, fila);
  return { id, codigo };
}

/**
 * Datos de contacto que el frontend muestra al confirmar mesa de partes. Salen
 * del contenido autogestionado, no de literales: si el instituto cambia el
 * correo o el enlace del FUT en el panel, el acuse lo refleja.
 */
async function datosDeContacto() {
  const institucion = await consultarUna('SELECT data FROM institucion WHERE id = 1 LIMIT 1');
  const semillaInst = institucion
    ? null
    : await consultarUna("SELECT data FROM semillas WHERE clave = 'institucion' LIMIT 1");
  const ficha = leerJson(institucion ? institucion.data : semillaInst && semillaInst.data, {}) || {};
  const contacto = ficha.contact || {};

  const costos = await consultarUna("SELECT data FROM contenido_modulos WHERE modulo = 'costos' LIMIT 1");
  const semillaCostos = costos
    ? null
    : await consultarUna("SELECT data FROM semillas WHERE clave = 'contenido:costos' LIMIT 1");
  const copyCostos = leerJson(costos ? costos.data : semillaCostos && semillaCostos.data, {}) || {};

  return {
    emailAdmin: contacto.emailAdmin || '',
    emailIntake: contacto.emailIntake || '',
    futUrl: copyCostos.futUrl || '',
  };
}

/** Mesa de partes: el frontend espera `IntakeSubmitResult`. */
async function registrarMesa(datos, contexto) {
  const { codigo } = await registrar(TIPOS.mesa, datos, contexto);
  const contacto = await datosDeContacto();
  const interno = contacto.emailIntake || contacto.emailAdmin || env.correo.receptor;

  await enviar({
    para: datos.correo,
    asunto: `Acuse de recibo — Mesa de partes ${codigo}`,
    html: acuseMesa({ codigo, datos }),
    texto: `Código: ${codigo}\nAsunto: ${datos.asunto || ''}`,
  });
  await enviar({
    para: interno,
    asunto: `Mesa de partes — ${codigo} — ${datos.asunto}`,
    html: avisoMesa({ codigo, datos }),
    texto: [`Nuevo documento recibido por mesa de partes virtual.`, `Código: ${codigo}`, textoPlano(datos)].join(
      '\n',
    ),
  });

  return { trackingCode: codigo, ...contacto };
}

/** Los otros cuatro trámites solo devuelven el código. */
async function registrarSimple(clave, datos, contexto) {
  const tipo = TIPOS[clave];
  if (!tipo) throw solicitudInvalida('Trámite desconocido.');
  const { codigo } = await registrar(tipo, datos, contexto);
  const contacto = await datosDeContacto();
  const interno = contacto.emailIntake || contacto.emailAdmin || env.correo.receptor;

  if (clave === 'reclamaciones') {
    await enviar({
      para: datos.email,
      asunto: `Acuse — Libro de reclamaciones ${codigo}`,
      html: acuseReclamo({ codigo, datos }),
      texto: `Código: ${codigo}`,
    });
    await enviar({
      para: interno,
      asunto: `Libro de reclamaciones — ${codigo}`,
      html: avisoReclamo({ codigo, datos }),
      texto: textoPlano(datos),
    });
  } else {
    await enviar({
      para: interno,
      asunto: `${tipo.entidad} — ${codigo}`,
      texto: textoPlano(datos),
    });
  }

  return { codigo };
}

/**
 * Seguimiento público. El código es corto y la consulta no pide identidad, así
 * que solo salen las claves listadas en `tipo.seguimiento`: nunca DNI, correo,
 * teléfono ni el texto del trámite. Mesa de partes conserva el contrato
 * `IntakeRecord` (trackingCode, submittedAt, status, payload).
 */
async function seguir(clave, codigo) {
  const tipo = TIPOS[clave];
  if (!tipo || !tipo.seguimiento) throw noEncontrado('No hay un trámite con ese código.');
  const fila = await repo.porCodigo(tipo, String(codigo).trim().toUpperCase());
  if (!fila) throw noEncontrado('No hay un trámite con ese código.');

  const payload = {};
  for (const campo of tipo.seguimiento.claves) {
    const columna = tipo.columnas[campo];
    const valor = fila[columna];
    if (valor === null || valor === undefined || valor === '') continue;
    payload[campo] = columna === 'folios' ? Number(valor) : valor;
  }

  const vista = {
    trackingCode: fila.codigo,
    submittedAt: aIso(fila.creado_en),
    status: fila.estado,
    payload,
  };
  if (tipo.seguimiento.incluirRespuesta) {
    vista.estado = fila.estado;
    vista.respuesta = fila[tipo.campoRespuesta] || null;
  }
  return vista;
}

const seguirMesa = (codigo) => seguir('mesa', codigo);

const listar = async (clave, filtros) =>
  (await repo.listar(TIPOS[clave], filtros)).map((fila) => aRegistroAdmin(TIPOS[clave], fila));

async function obtener(clave, id) {
  const fila = await repo.porId(TIPOS[clave], id);
  if (!fila) throw noEncontrado('Trámite no encontrado.');
  return aRegistroAdmin(TIPOS[clave], fila);
}

/**
 * Cambio de estado desde el panel. Si quien atiende marcó "notificar", el
 * solicitante recibe la respuesta por correo; hasta ahora se guardaba en el
 * expediente y el ciudadano no se enteraba salvo que consultara su código.
 *
 * El correo no puede tumbar el guardado: el estado ya está en la base cuando se
 * intenta enviar, y `enviar` nunca lanza. Se devuelve `notificado` para que el
 * panel diga la verdad en el aviso, en vez de prometer un correo que no salió.
 */
async function actualizar(clave, id, datos) {
  const tipo = TIPOS[clave];
  if (!tipo.estados.includes(datos.estado)) {
    throw solicitudInvalida(`Estado inválido. Use uno de: ${tipo.estados.join(', ')}.`);
  }
  const fila = await repo.porId(tipo, id);
  if (!fila) throw noEncontrado('Trámite no encontrado.');

  const cerrados = tipo.cerrados || [];
  if (cerrados.includes(fila.estado) && datos.estado !== fila.estado) {
    throw solicitudInvalida(
      `El expediente ya está ${fila.estado.replace(/_/g, ' ')} y no se puede reabrir.`,
    );
  }

  const respuesta = datos.respuesta ?? datos.observacion ?? datos.notas ?? null;
  const pasaAExigirMotivo = (tipo.exigenMotivo || []).includes(datos.estado) && datos.estado !== fila.estado;
  if (pasaAExigirMotivo && !String(respuesta || '').trim()) {
    throw solicitudInvalida('Debe indicar el motivo o la respuesta en el expediente.');
  }

  await repo.actualizarEstado(tipo, id, { estado: datos.estado, respuesta });

  const tramite = await obtener(clave, id);
  const notificado = datos.notificar ? await notificarSolicitante(tipo, tramite) : false;
  return { ...tramite, notificado };
}

/** Devuelve si el correo llegó a salir (falta de dirección o SMTP caído → false). */
async function notificarSolicitante(tipo, tramite) {
  const destino = tramite.payload[tipo.campoCorreo];
  if (!destino) return false;

  const nombre = [tramite.payload.nombres, tramite.payload.apellidos].filter(Boolean).join(' ');
  const estado = tramite.estado.replace(/_/g, ' ');

  return enviar({
    para: destino,
    asunto: `${tipo.etiqueta} ${tramite.codigo} — respuesta a su solicitud`,
    html: respuestaTramite({
      codigo: tramite.codigo,
      etiqueta: tipo.etiqueta,
      nombre,
      estado,
      respuesta: tramite.respuesta,
    }),
    texto: [
      `${tipo.etiqueta} — ${tramite.codigo}`,
      `Estado: ${estado}`,
      tramite.respuesta ? `\nRespuesta:\n${tramite.respuesta}` : '',
    ].join('\n'),
  });
}

/** Resumen para el tablero del panel. */
async function resumen() {
  const claves = Object.keys(TIPOS);
  const conteos = await Promise.all(claves.map((clave) => repo.pendientes(TIPOS[clave])));
  return claves.reduce((acumulado, clave, indice) => {
    acumulado[TIPOS[clave].entidad] = Number(conteos[indice].total);
    return acumulado;
  }, {});
}

module.exports = { registrarMesa, registrarSimple, seguir, seguirMesa, listar, obtener, actualizar, resumen };
