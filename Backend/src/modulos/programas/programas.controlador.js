const asincrono = require('../../lib/asincrono');
const servicio = require('./programas.servicio');
const { registrar } = require('../../lib/auditoria');

const listar = asincrono(async (_req, res) => res.json(await servicio.listar()));

const crear = asincrono(async (req, res) => {
  const programa = await servicio.crear(req.body);
  await registrar(req, { accion: 'crear', entidad: 'programas', entidadId: programa.id });
  res.status(201).json(programa);
});

const actualizar = asincrono(async (req, res) => {
  const programa = await servicio.actualizar(req.params.id, req.body);
  await registrar(req, { accion: 'actualizar', entidad: 'programas', entidadId: programa.id });
  res.json(programa);
});

const eliminar = asincrono(async (req, res) => {
  await servicio.eliminar(req.params.id);
  await registrar(req, { accion: 'eliminar', entidad: 'programas', entidadId: req.params.id });
  res.status(204).end();
});

module.exports = { listar, crear, actualizar, eliminar };
