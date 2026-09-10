const { consultar, consultarUna, ejecutar } = require('../../config/db');
const { escribirJson } = require('../../lib/json');

const CAMPOS = `id, titulo, nivel, categoria, duracion, duracion_semestres, titulo_otorgado,
                normativa, vacantes, rango_edad, turnos, descripcion, perfil, campo_laboral,
                imagen, destacado, orden, activo`;

const listar = ({ soloActivos = true } = {}) =>
  consultar(
    `SELECT ${CAMPOS} FROM programas
      ${soloActivos ? 'WHERE activo = 1' : ''}
      ORDER BY FIELD(nivel, 'FID', 'Técnica', 'Formación Continua'), orden, titulo`,
  );

const porId = (id) => consultarUna(`SELECT ${CAMPOS} FROM programas WHERE id = ? LIMIT 1`, [id]);

const existe = async (id) =>
  Boolean(await consultarUna('SELECT id FROM programas WHERE id = ? LIMIT 1', [id]));

const siguienteOrden = async () => {
  const fila = await consultarUna('SELECT COALESCE(MAX(orden), 0) + 1 AS n FROM programas');
  return Number(fila.n);
};

const crear = (p) =>
  ejecutar(
    `INSERT INTO programas (id, titulo, nivel, categoria, duracion, duracion_semestres, titulo_otorgado,
       normativa, vacantes, rango_edad, turnos, descripcion, perfil, campo_laboral, imagen, destacado, orden, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      p.id,
      p.titulo,
      p.nivel,
      p.categoria,
      p.duracion,
      p.duracion_semestres,
      p.titulo_otorgado,
      p.normativa,
      p.vacantes,
      p.rango_edad,
      escribirJson(p.turnos),
      p.descripcion,
      p.perfil,
      escribirJson(p.campo_laboral),
      p.imagen,
      p.destacado,
      p.orden,
    ],
  );

const actualizar = (id, p) =>
  ejecutar(
    `UPDATE programas
        SET titulo = ?, nivel = ?, categoria = ?, duracion = ?, duracion_semestres = ?,
            titulo_otorgado = ?, normativa = ?, vacantes = ?, rango_edad = ?, turnos = ?,
            descripcion = ?, perfil = ?, campo_laboral = ?, imagen = ?, destacado = ?
      WHERE id = ?`,
    [
      p.titulo,
      p.nivel,
      p.categoria,
      p.duracion,
      p.duracion_semestres,
      p.titulo_otorgado,
      p.normativa,
      p.vacantes,
      p.rango_edad,
      escribirJson(p.turnos),
      p.descripcion,
      p.perfil,
      escribirJson(p.campo_laboral),
      p.imagen,
      p.destacado,
      id,
    ],
  );

const eliminar = (id) => ejecutar('DELETE FROM programas WHERE id = ?', [id]);

module.exports = { listar, porId, existe, siguienteOrden, crear, actualizar, eliminar };
