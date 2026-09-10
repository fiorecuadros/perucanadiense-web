const { consultar, consultarUna, ejecutar, enTransaccion } = require('../../config/db');
const { escribirJson } = require('../../lib/json');

const CAMPOS = `id, titulo, categoria, categoria_label, extracto, parrafos, imagen, imagen_alt,
                fecha, destacada, publicada, creado_en`;

const listar = ({ soloPublicadas = true } = {}) =>
  consultar(
    `SELECT ${CAMPOS} FROM noticias
      ${soloPublicadas ? 'WHERE publicada = 1' : ''}
      ORDER BY destacada DESC, fecha DESC, creado_en DESC`,
  );

const porId = (id) => consultarUna(`SELECT ${CAMPOS} FROM noticias WHERE id = ? LIMIT 1`, [id]);

const existe = async (id) => Boolean(await consultarUna('SELECT id FROM noticias WHERE id = ? LIMIT 1', [id]));

const crear = (n) =>
  ejecutar(
    `INSERT INTO noticias (id, titulo, categoria, categoria_label, extracto, parrafos, imagen, imagen_alt, fecha, destacada, publicada)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      n.id,
      n.titulo,
      n.categoria,
      n.categoria_label,
      n.extracto,
      escribirJson(n.parrafos),
      n.imagen,
      n.imagen_alt,
      n.fecha,
      n.destacada,
      n.publicada,
    ],
  );

const actualizar = (id, n) =>
  ejecutar(
    `UPDATE noticias
        SET titulo = ?, categoria = ?, categoria_label = ?, extracto = ?, parrafos = ?,
            imagen = ?, imagen_alt = ?, fecha = ?, destacada = ?, publicada = ?
      WHERE id = ?`,
    [
      n.titulo,
      n.categoria,
      n.categoria_label,
      n.extracto,
      escribirJson(n.parrafos),
      n.imagen,
      n.imagen_alt,
      n.fecha,
      n.destacada,
      n.publicada,
      id,
    ],
  );

const eliminar = (id) => ejecutar('DELETE FROM noticias WHERE id = ?', [id]);

/**
 * Una destacada por familia: noticias/eventos y comunicados no se pisan.
 * Así Inicio puede mostrar una noticia destacada y un comunicado destacado.
 */
const quitarDestacadaSalvo = (id, categoria) =>
  ejecutar(
    categoria === 'comunicado'
      ? `UPDATE noticias SET destacada = 0
           WHERE destacada = 1 AND id <> ? AND categoria = 'comunicado'`
      : `UPDATE noticias SET destacada = 0
           WHERE destacada = 1 AND id <> ? AND categoria <> 'comunicado'`,
    [id],
  );

module.exports = { listar, porId, existe, crear, actualizar, eliminar, quitarDestacadaSalvo, enTransaccion };
