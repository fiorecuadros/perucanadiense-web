const asincrono = require('../../lib/asincrono');
const servicio = require('./repositorio.servicio');
const archivos = require('../archivos/archivos.servicio');
const { registrar } = require('../../lib/auditoria');

const listar = asincrono(async (_req, res) => res.json(await servicio.listar()));
const obtener = asincrono(async (req, res) => res.json(await servicio.obtener(req.params.id)));

const crear = asincrono(async (req, res) => {
  const tesis = await servicio.crear(req.body);
  await registrar(req, { accion: 'crear', entidad: 'repositorio', entidadId: tesis.id });
  res.status(201).json(tesis);
});

const actualizar = asincrono(async (req, res) => {
  const tesis = await servicio.actualizar(req.params.id, req.body);
  await registrar(req, { accion: 'actualizar', entidad: 'repositorio', entidadId: tesis.id });
  res.json(tesis);
});

const eliminar = asincrono(async (req, res) => {
  await servicio.eliminar(req.params.id);
  await registrar(req, { accion: 'eliminar', entidad: 'repositorio', entidadId: req.params.id });
  res.status(204).end();
});

/** Sube el PDF de la tesis y lo enlaza en un solo paso. */
const adjuntar = asincrono(async (req, res) => {
  const archivo = await archivos.guardar(req.file, req.usuario.id);
  const tesis = await servicio.adjuntar(req.params.id, archivo.id);
  await registrar(req, { accion: 'actualizar', entidad: 'repositorio', entidadId: tesis.id, datos: { archivo: archivo.id } });
  res.status(201).json(tesis);
});

module.exports = { listar, obtener, crear, actualizar, eliminar, adjuntar };
