const asincrono = require('../../lib/asincrono');
const servicio = require('./contenido.servicio');
const { registrar } = require('../../lib/auditoria');

const obtener = asincrono(async (req, res) => {
  res.json(await servicio.obtener(req.params.modulo));
});

const guardar = asincrono(async (req, res) => {
  const data = await servicio.guardar(req.params.modulo, req.body, req.usuario.id);
  await registrar(req, { accion: 'actualizar', entidad: 'contenido', entidadId: req.params.modulo });
  res.json(data);
});

const restaurar = asincrono(async (req, res) => {
  const data = await servicio.restaurar(req.params.modulo, req.usuario.id);
  await registrar(req, { accion: 'restaurar', entidad: 'contenido', entidadId: req.params.modulo });
  res.json(data);
});

const versiones = asincrono(async (req, res) => {
  res.json(await servicio.versiones(req.params.modulo));
});

const version = asincrono(async (req, res) => {
  res.json(await servicio.version(req.params.modulo, req.params.id));
});

const restaurarVersion = asincrono(async (req, res) => {
  const data = await servicio.restaurarVersion(req.params.modulo, req.params.id, req.usuario.id);
  await registrar(req, {
    accion: 'restaurar',
    entidad: 'contenido',
    entidadId: req.params.modulo,
    datos: { versionId: req.params.id },
  });
  res.json(data);
});

module.exports = { obtener, guardar, restaurar, versiones, version, restaurarVersion };
