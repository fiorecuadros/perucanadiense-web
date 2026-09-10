const { consultar, consultarUna, ejecutar } = require('../../config/db');
const { escribirJson } = require('../../lib/json');

const CAMPOS = 'id, titulo, autores, programa, anio, tipo, nivel, resumen, archivo_id, publicado';

const listar = ({ soloPublicados = true } = {}) =>
  consultar(
    `SELECT ${CAMPOS} FROM repositorio
      ${soloPublicados ? 'WHERE publicado = 1' : ''}
      ORDER BY anio DESC, titulo`,
  );

const porId = (id) => consultarUna(`SELECT ${CAMPOS} FROM repositorio WHERE id = ? LIMIT 1`, [id]);

const existe = async (id) => Boolean(await consultarUna('SELECT id FROM repositorio WHERE id = ? LIMIT 1', [id]));

const crear = (t) =>
  ejecutar(
    `INSERT INTO repositorio (id, titulo, autores, programa, anio, tipo, nivel, resumen, archivo_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [t.id, t.titulo, escribirJson(t.autores), t.programa, t.anio, t.tipo, t.nivel, t.resumen, t.archivo_id || null],
  );

const actualizar = (id, t) =>
  ejecutar(
    `UPDATE repositorio
        SET titulo = ?, autores = ?, programa = ?, anio = ?, tipo = ?, nivel = ?, resumen = ?
      WHERE id = ?`,
    [t.titulo, escribirJson(t.autores), t.programa, t.anio, t.tipo, t.nivel, t.resumen, id],
  );

const asignarArchivo = (id, archivoId) =>
  ejecutar('UPDATE repositorio SET archivo_id = ? WHERE id = ?', [archivoId, id]);

const eliminar = (id) => ejecutar('DELETE FROM repositorio WHERE id = ?', [id]);

module.exports = { listar, porId, existe, crear, actualizar, asignarArchivo, eliminar };
