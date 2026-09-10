const { Router } = require('express');
const asincrono = require('../../lib/asincrono');
const { exigirSesion } = require('../../middlewares/auth');
const { consultar, consultarUna } = require('../../config/db');
const { aIso } = require('../../lib/fechas');
const tramites = require('../tramites/tramites.servicio');

const router = Router();

/**
 * Resumen para /admin/dashboard: qué hay publicado, qué está en borrador y qué
 * quedó sin atender. Una sola llamada en vez de que el panel pida seis listados.
 */
router.get(
  '/admin/panel/resumen',
  exigirSesion,
  asincrono(async (_req, res) => {
    const [documentos] = await consultar(
      `SELECT SUM(estado = 'publicado') AS publicados, SUM(estado = 'borrador') AS borradores FROM documentos`,
    );
    const noticias = await consultarUna('SELECT COUNT(*) AS total FROM noticias WHERE publicada = 1');
    const personal = await consultarUna('SELECT COUNT(*) AS total FROM personal WHERE activo = 1');
    const repositorio = await consultarUna('SELECT COUNT(*) AS total FROM repositorio WHERE publicado = 1');

    const ultimos = await consultar(
      `SELECT a.accion, a.entidad, a.entidad_id, a.creado_en, u.nombre AS usuario
         FROM auditoria a LEFT JOIN usuarios u ON u.id = a.usuario_id
        ORDER BY a.creado_en DESC LIMIT 10`,
    );

    res.json({
      documentos: {
        publicados: Number(documentos.publicados || 0),
        borradores: Number(documentos.borradores || 0),
      },
      noticias: Number(noticias.total),
      personal: Number(personal.total),
      repositorio: Number(repositorio.total),
      tramitesPendientes: await tramites.resumen(),
      actividad: ultimos.map((fila) => ({
        accion: fila.accion,
        entidad: fila.entidad,
        entidadId: fila.entidad_id,
        usuario: fila.usuario || 'sistema',
        fecha: aIso(fila.creado_en),
      })),
    });
  }),
);

module.exports = router;
