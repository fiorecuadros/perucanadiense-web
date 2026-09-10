const asincrono = require('../../lib/asincrono');
const servicio = require('./tramites.servicio');
const archivos = require('../archivos/archivos.servicio');
const { registrar } = require('../../lib/auditoria');

const contextoDe = (req) => ({ ip: req.ip, userAgent: req.headers['user-agent'] });

/**
 * Mesa de partes acepta JSON (lo que manda el frontend hoy) y multipart con el
 * adjunto real. Cuando el front envíe el archivo, este endpoint ya lo guarda.
 */
const crearMesa = asincrono(async (req, res) => {
  let archivoId = null;
  if (req.file) {
    // Reservado: lo sube un anónimo y contiene sus datos personales. Sin esto
    // el adjunto quedaría descargable por cualquiera que tuviese la URL.
    const guardado = await archivos.guardar(req.file, null, { publico: false });
    archivoId = guardado.id;
  }
  const resultado = await servicio.registrarMesa(req.body, { ...contextoDe(req), archivoId });
  res.status(201).json(resultado);
});

const crearSimple = (clave) =>
  asincrono(async (req, res) => {
    const resultado = await servicio.registrarSimple(clave, req.body, contextoDe(req));
    res.status(201).json(resultado);
  });

const seguir = (clave) =>
  asincrono(async (req, res) => {
    res.json(await servicio.seguir(clave, req.params.codigo));
  });

const listar = (clave) =>
  asincrono(async (req, res) => {
    res.json(await servicio.listar(clave, req.query));
  });

const obtener = (clave) =>
  asincrono(async (req, res) => {
    res.json(await servicio.obtener(clave, req.params.id));
  });

const actualizar = (clave) =>
  asincrono(async (req, res) => {
    const tramite = await servicio.actualizar(clave, req.params.id, req.body);
    await registrar(req, {
      accion: 'actualizar',
      entidad: `tramites:${clave}`,
      entidadId: req.params.id,
      // Un reclamo tiene plazo legal de respuesta: hay que poder demostrar
      // cuándo se avisó al ciudadano, no solo cuándo se cambió el estado.
      datos: { estado: tramite.estado, notificado: tramite.notificado },
    });
    res.json(tramite);
  });

const resumen = asincrono(async (_req, res) => res.json(await servicio.resumen()));

module.exports = { crearMesa, crearSimple, seguir, listar, obtener, actualizar, resumen };
