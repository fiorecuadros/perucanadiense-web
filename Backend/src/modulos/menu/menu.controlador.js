const asincrono = require('../../lib/asincrono');
const servicio = require('./menu.servicio');
const { registrar } = require('../../lib/auditoria');

const listarPublico = asincrono(async (_req, res) => res.json(await servicio.listarPublico()));

const listarAdmin = asincrono(async (_req, res) => res.json(await servicio.listarAdmin()));

const crear = asincrono(async (req, res) => {
  const item = await servicio.crear(req.body);
  await registrar(req, {
    accion: 'crear',
    entidad: 'menu',
    entidadId: item.id,
    datos: { zona: item.zona, etiqueta: item.etiqueta },
  });
  res.status(201).json(item);
});

const actualizar = asincrono(async (req, res) => {
  const item = await servicio.actualizar(req.params.id, req.body);
  await registrar(req, {
    accion: 'actualizar',
    entidad: 'menu',
    entidadId: item.id,
    datos: { zona: item.zona, etiqueta: item.etiqueta, visible: item.visible },
  });
  res.json(item);
});

const eliminar = asincrono(async (req, res) => {
  await servicio.eliminar(req.params.id);
  await registrar(req, { accion: 'eliminar', entidad: 'menu', entidadId: req.params.id });
  res.status(204).end();
});

const reordenar = asincrono(async (req, res) => {
  const resultado = await servicio.reordenar(req.body.items);
  await registrar(req, { accion: 'actualizar', entidad: 'menu', datos: resultado });
  res.json(await servicio.listarAdmin());
});

const restaurar = asincrono(async (req, res) => {
  const items = await servicio.restaurar();
  await registrar(req, { accion: 'restaurar', entidad: 'menu', datos: { items: items.length } });
  res.json(items);
});

module.exports = { listarPublico, listarAdmin, crear, actualizar, eliminar, reordenar, restaurar };
