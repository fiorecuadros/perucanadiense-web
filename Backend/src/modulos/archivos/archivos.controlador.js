const fs = require('fs');
const asincrono = require('../../lib/asincrono');
const servicio = require('./archivos.servicio');
const { registrar } = require('../../lib/auditoria');
const { noAutorizado } = require('../../lib/errores');

const subir = asincrono(async (req, res) => {
  const archivo = await servicio.guardar(req.file, req.usuario.id);
  await registrar(req, { accion: 'crear', entidad: 'archivos', entidadId: archivo.id, datos: { nombre: archivo.nombre } });
  res.status(201).json(archivo);
});

const descargar = asincrono(async (req, res) => {
  const { ruta, mime, nombre, publico } = await servicio.obtener(req.params.id);

  // Un adjunto de trámite lleva el DNI y el asunto del ciudadano: solo se abre
  // desde el panel. Se responde 401 (no 404) para no obligar a distinguir entre
  // "no existe" y "no puedes": quien tiene sesión verá el archivo igual.
  if (!publico && !req.usuario) {
    throw noAutorizado('Este archivo es reservado: inicie sesión en el panel para abrirlo.');
  }

  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(nombre)}"`);
  // Un reservado no puede quedar cacheado en proxies intermedios.
  res.setHeader('Cache-Control', publico ? 'public, max-age=3600' : 'private, no-store');
  if (!publico) {
    await registrar(req, { accion: 'descargar', entidad: 'archivos', entidadId: req.params.id });
  }
  fs.createReadStream(ruta)
    .on('error', (error) => {
      if (res.destroyed) return;

      if (res.headersSent) {
        res.destroy();
        return;
      }

      res.removeHeader('Content-Disposition');
      res.setHeader('Cache-Control', 'no-store');

      const falta = error.code === 'ENOENT';
      res.status(falta ? 404 : 500).json({
        message: falta
          ? 'El archivo ya no está disponible.'
          : 'No se pudo leer el archivo.',
      });
    })
    .pipe(res);
});

const eliminar = asincrono(async (req, res) => {
  await servicio.eliminar(req.params.id);
  await registrar(req, { accion: 'eliminar', entidad: 'archivos', entidadId: req.params.id });
  res.status(204).end();
});

module.exports = { subir, descargar, eliminar };
