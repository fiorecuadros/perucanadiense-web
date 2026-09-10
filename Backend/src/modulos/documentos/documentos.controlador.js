const asincrono = require('../../lib/asincrono');
const servicio = require('./documentos.servicio');
const { registrar } = require('../../lib/auditoria');

/** Listado público: solo publicados, aunque no manden el filtro. */
const listarPublico = asincrono(async (req, res) => {
  const { modulo, seccion } = req.datosValidados || {};
  res.json(await servicio.listar({ modulo, seccion, estado: 'publicado' }));
});

/** Listado del panel: incluye borradores. */
const listarAdmin = asincrono(async (req, res) => {
  res.json(await servicio.listar(req.datosValidados || {}));
});

const crear = asincrono(async (req, res) => {
  const documento = await servicio.crear(req.body);
  await registrar(req, {
    accion: 'crear',
    entidad: 'documentos',
    entidadId: documento.id,
    datos: { modulo: documento.modulo, seccion: documento.seccion, titulo: documento.titulo },
  });
  res.status(201).json(documento);
});

const actualizar = asincrono(async (req, res) => {
  const documento = await servicio.actualizar(req.params.id, req.body);
  await registrar(req, {
    accion: documento.estado === 'publicado' ? 'publicar' : 'actualizar',
    entidad: 'documentos',
    entidadId: documento.id,
    datos: { titulo: documento.titulo, estado: documento.estado },
  });
  res.json(documento);
});

const eliminar = asincrono(async (req, res) => {
  const documento = await servicio.eliminar(req.params.id);
  await registrar(req, {
    accion: 'eliminar',
    entidad: 'documentos',
    entidadId: req.params.id,
    datos: { titulo: documento.titulo, modulo: documento.modulo },
  });
  res.status(204).end();
});

const restaurar = asincrono(async (req, res) => {
  const documentos = await servicio.restaurarModulo(req.params.modulo);
  await registrar(req, { accion: 'restaurar', entidad: 'documentos', entidadId: req.params.modulo });
  res.json(documentos);
});

module.exports = { listarPublico, listarAdmin, crear, actualizar, eliminar, restaurar };
