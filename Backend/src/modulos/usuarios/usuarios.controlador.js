const asincrono = require('../../lib/asincrono');
const servicio = require('./usuarios.servicio');
const { registrar } = require('../../lib/auditoria');

const listar = asincrono(async (_req, res) => res.json(await servicio.listar()));

const obtener = asincrono(async (req, res) => res.json(await servicio.obtener(req.params.id)));

const crear = asincrono(async (req, res) => {
  const usuario = await servicio.crear(req.body);
  await registrar(req, { accion: 'crear', entidad: 'usuarios', entidadId: usuario.id });
  res.status(201).json(usuario);
});

const actualizar = asincrono(async (req, res) => {
  const usuario = await servicio.actualizar(req.params.id, req.body);
  await registrar(req, { accion: 'actualizar', entidad: 'usuarios', entidadId: usuario.id });
  res.json(usuario);
});

const eliminar = asincrono(async (req, res) => {
  await servicio.eliminar(req.params.id, req.usuario.id);
  await registrar(req, { accion: 'eliminar', entidad: 'usuarios', entidadId: req.params.id });
  res.status(204).end();
});

module.exports = { listar, obtener, crear, actualizar, eliminar };
