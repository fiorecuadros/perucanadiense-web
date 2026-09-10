const { consultar, consultarUna, enTransaccion } = require('../../config/db');
const { escribirJson } = require('../../lib/json');

const porModulo = (modulo) =>
  consultarUna('SELECT modulo, data, actualizado_en FROM contenido_modulos WHERE modulo = ? LIMIT 1', [modulo]);

const semilla = (modulo) =>
  consultarUna('SELECT data FROM semillas WHERE clave = ? LIMIT 1', [`contenido:${modulo}`]);

/**
 * Guarda el módulo y archiva la versión anterior en la misma transacción:
 * si algo falla, ni se pierde el historial ni queda escrito a medias.
 */
function guardar(modulo, data, usuarioId) {
  return enTransaccion(async (conexion) => {
    const [previas] = await conexion.execute(
      'SELECT data FROM contenido_modulos WHERE modulo = ? FOR UPDATE',
      [modulo],
    );
    if (previas.length) {
      await conexion.execute(
        'INSERT INTO contenido_versiones (modulo, data, usuario_id) VALUES (?, ?, ?)',
        [modulo, typeof previas[0].data === 'string' ? previas[0].data : escribirJson(previas[0].data), usuarioId],
      );
    }
    await conexion.execute(
      `INSERT INTO contenido_modulos (modulo, data, actualizado_por)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data), actualizado_por = VALUES(actualizado_por)`,
      [modulo, escribirJson(data), usuarioId],
    );
  });
}

/** MySQL rechaza un marcador en LIMIT, así que el tope se sanea como entero. */
const versiones = (modulo, limite = 20) => {
  const tope = Math.min(Math.max(parseInt(limite, 10) || 20, 1), 100);
  return consultar(
    `SELECT v.id, v.usuario_id, v.creado_en, u.nombre AS autor
       FROM contenido_versiones v
       LEFT JOIN usuarios u ON u.id = v.usuario_id
      WHERE v.modulo = ? ORDER BY v.creado_en DESC LIMIT ${tope}`,
    [modulo],
  );
};

const versionPorId = (modulo, id) =>
  consultarUna(
    `SELECT v.id, v.modulo, v.data, v.usuario_id, v.creado_en, u.nombre AS autor
       FROM contenido_versiones v
       LEFT JOIN usuarios u ON u.id = v.usuario_id
      WHERE v.modulo = ? AND v.id = ? LIMIT 1`,
    [modulo, id],
  );

module.exports = { porModulo, semilla, guardar, versiones, versionPorId };
