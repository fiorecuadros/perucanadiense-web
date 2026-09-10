const asincrono = require('../../lib/asincrono');
const servicio = require('./noticias.servicio');
const { registrar } = require('../../lib/auditoria');

const listar = asincrono(async (_req, res) => res.json(await servicio.listar()));
const listarAdmin = asincrono(async (_req, res) => res.json(await servicio.listarAdmin()));
const obtener = asincrono(async (req, res) => res.json(await servicio.obtener(req.params.id)));

const crear = asincrono(async (req, res) => {
  const noticia = await servicio.crear(req.body);
  await registrar(req, { accion: 'crear', entidad: 'noticias', entidadId: noticia.id, datos: { titulo: noticia.title } });
  res.status(201).json(noticia);
});

const actualizar = asincrono(async (req, res) => {
  const noticia = await servicio.actualizar(req.params.id, req.body);
  await registrar(req, { accion: 'actualizar', entidad: 'noticias', entidadId: noticia.id });
  res.json(noticia);
});

const eliminar = asincrono(async (req, res) => {
  await servicio.eliminar(req.params.id);
  await registrar(req, { accion: 'eliminar', entidad: 'noticias', entidadId: req.params.id });
  res.status(204).end();
});

module.exports = { listar, listarAdmin, obtener, crear, actualizar, eliminar };
