const { consultar, consultarUna, ejecutar } = require('../../config/db');

const CAMPOS = `id, modulo, seccion, titulo, descripcion, tipo, url, archivo_id, anio, orden, estado, actualizado_en`;

/** Filtro dinámico: solo se añade lo que realmente llegó por query. */
function listar({ modulo, seccion, estado } = {}) {
  const condiciones = [];
  const valores = [];
  if (modulo) {
    condiciones.push('modulo = ?');
    valores.push(modulo);
  }
  if (seccion) {
    condiciones.push('seccion = ?');
    valores.push(seccion);
  }
  if (estado) {
    condiciones.push('estado = ?');
    valores.push(estado);
  }
  const donde = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  return consultar(
    `SELECT ${CAMPOS} FROM documentos ${donde} ORDER BY modulo, seccion, orden, titulo`,
    valores,
  );
}

const porId = (id) => consultarUna(`SELECT ${CAMPOS} FROM documentos WHERE id = ? LIMIT 1`, [id]);

const crear = (d) =>
  ejecutar(
    `INSERT INTO documentos (id, modulo, seccion, titulo, descripcion, tipo, url, archivo_id, anio, orden, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.id, d.modulo, d.seccion, d.titulo, d.descripcion, d.tipo, d.url, d.archivo_id, d.anio, d.orden, d.estado],
  );

const actualizar = (id, d) =>
  ejecutar(
    `UPDATE documentos
        SET modulo = ?, seccion = ?, titulo = ?, descripcion = ?, tipo = ?, url = ?,
            archivo_id = ?, anio = ?, orden = ?, estado = ?
      WHERE id = ?`,
    [d.modulo, d.seccion, d.titulo, d.descripcion, d.tipo, d.url, d.archivo_id, d.anio, d.orden, d.estado, id],
  );

const eliminar = (id) => ejecutar('DELETE FROM documentos WHERE id = ?', [id]);

const eliminarModulo = (modulo) => ejecutar('DELETE FROM documentos WHERE modulo = ?', [modulo]);

const semilla = () => consultarUna("SELECT data FROM semillas WHERE clave = 'documentos' LIMIT 1");

module.exports = { listar, porId, crear, actualizar, eliminar, eliminarModulo, semilla };
