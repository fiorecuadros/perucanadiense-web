const asincrono = require('../../lib/asincrono');
const servicio = require('./personal.servicio');
const { registrar } = require('../../lib/auditoria');

const listar = asincrono(async (_req, res) => res.json(await servicio.listar()));

const crear = asincrono(async (req, res) => {
  const miembro = await servicio.crear(req.body);
  await registrar(req, {
    accion: 'crear',
    entidad: 'personal',
    entidadId: miembro.id,
    datos: { nombre: `${miembro.names} ${miembro.lastNames}` },
  });
  res.status(201).json(miembro);
});

const actualizar = asincrono(async (req, res) => {
  const miembro = await servicio.actualizar(req.params.id, req.body);
  await registrar(req, { accion: 'actualizar', entidad: 'personal', entidadId: miembro.id });
  res.json(miembro);
});

const eliminar = asincrono(async (req, res) => {
  await servicio.eliminar(req.params.id);
  await registrar(req, { accion: 'eliminar', entidad: 'personal', entidadId: req.params.id });
  res.status(204).end();
});

module.exports = { listar, crear, actualizar, eliminar };
