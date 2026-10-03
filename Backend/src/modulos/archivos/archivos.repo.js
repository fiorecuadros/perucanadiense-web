const { consultar, consultarUna, ejecutar } = require('../../config/db');

const CAMPOS = 'id, nombre_original, ruta_relativa, mime, bytes, sha256, subido_por, publico, creado_en';

const porId = (id) => consultarUna(`SELECT ${CAMPOS} FROM archivos WHERE id = ? LIMIT 1`, [id]);

/** Solo reutiliza dentro de la misma visibilidad: ver `guardar` en el servicio. */
const porHash = (sha256, publico = true) =>
  consultarUna(
    `SELECT ${CAMPOS} FROM archivos WHERE sha256 = ? AND publico = ? ORDER BY creado_en LIMIT 1`,
    [sha256, publico ? 1 : 0],
  );

const crear = (archivo) =>
  ejecutar(
    `INSERT INTO archivos (id, nombre_original, ruta_relativa, mime, bytes, sha256, subido_por, publico)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      archivo.id,
      archivo.nombre_original,
      archivo.ruta_relativa,
      archivo.mime,
      archivo.bytes,
      archivo.sha256,
      archivo.subido_por,
      archivo.publico ? 1 : 0,
    ],
  );

const eliminar = (id) => ejecutar('DELETE FROM archivos WHERE id = ?', [id]);

/** ¿Alguien sigue apuntando a este archivo? Evita borrar un PDF aún publicado. */
async function referencias(id) {
  // Buscar también en contenido JSON y en versiones restaurables.
  // Una coincidencia conserva el archivo para evitar referencias rotas.
  const filas = await consultar(
    `SELECT
       (SELECT COUNT(*) FROM documentos WHERE archivo_id = ?) AS documentos,
       (SELECT COUNT(*) FROM repositorio WHERE archivo_id = ?) AS repositorio,
       (SELECT COUNT(*) FROM tramites_mesa_partes WHERE archivo_id = ?) AS mesa,
       (SELECT COUNT(*) FROM contenido_modulos
         WHERE LOCATE(?, CAST(data AS CHAR)) > 0) AS contenido,
       (SELECT COUNT(*) FROM contenido_versiones
         WHERE LOCATE(?, CAST(data AS CHAR)) > 0) AS versiones,
       (SELECT COUNT(*) FROM semillas
         WHERE LOCATE(?, CAST(data AS CHAR)) > 0) AS semillas,
       (SELECT COUNT(*) FROM institucion
         WHERE LOCATE(?, CAST(data AS CHAR)) > 0) AS institucion,
       (SELECT COUNT(*) FROM noticias
         WHERE LOCATE(?, imagen) > 0) AS noticias,
       (SELECT COUNT(*) FROM personal
         WHERE LOCATE(?, imagen) > 0) AS personal,
       (SELECT COUNT(*) FROM programas
         WHERE LOCATE(?, imagen) > 0) AS programas`,
    Array(10).fill(id),
  );

  const fila = filas[0] || {};
  return Object.values(fila).reduce(
    (total, cantidad) => total + Number(cantidad || 0),
    0
  );
}

module.exports = { porId, porHash, crear, eliminar, referencias };
