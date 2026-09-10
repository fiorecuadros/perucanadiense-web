const { consultar, consultarUna, ejecutar } = require('../../config/db');

const CAMPOS = 'id, tipo, nombres, apellidos, cargo, area, grado, email, imagen, cv_url, orden, activo';

const listar = () =>
  consultar(
    `SELECT ${CAMPOS} FROM personal WHERE activo = 1
      ORDER BY FIELD(tipo, 'Autoridad', 'Administrativo', 'Docente'), orden, apellidos`,
  );

const porId = (id) => consultarUna(`SELECT ${CAMPOS} FROM personal WHERE id = ? LIMIT 1`, [id]);

const crear = (p) =>
  ejecutar(
    `INSERT INTO personal (tipo, nombres, apellidos, cargo, area, grado, email, imagen, cv_url, orden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.tipo, p.nombres, p.apellidos, p.cargo, p.area, p.grado, p.email, p.imagen, p.cv_url, p.orden],
  );

/** Alta con id fijo: solo la usa la siembra inicial, para respetar el directorio oficial. */
const crearConId = (id, p) =>
  ejecutar(
    `INSERT INTO personal (id, tipo, nombres, apellidos, cargo, area, grado, email, imagen, cv_url, orden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE tipo = VALUES(tipo), nombres = VALUES(nombres), apellidos = VALUES(apellidos),
       cargo = VALUES(cargo), area = VALUES(area), grado = VALUES(grado), email = VALUES(email),
       imagen = VALUES(imagen), cv_url = VALUES(cv_url), orden = VALUES(orden)`,
    [id, p.tipo, p.nombres, p.apellidos, p.cargo, p.area, p.grado, p.email, p.imagen, p.cv_url, p.orden],
  );

const actualizar = (id, p) =>
  ejecutar(
    `UPDATE personal
        SET tipo = ?, nombres = ?, apellidos = ?, cargo = ?, area = ?, grado = ?,
            email = ?, imagen = ?, cv_url = ?, orden = ?
      WHERE id = ?`,
    [p.tipo, p.nombres, p.apellidos, p.cargo, p.area, p.grado, p.email, p.imagen, p.cv_url, p.orden, id],
  );

const eliminar = (id) => ejecutar('DELETE FROM personal WHERE id = ?', [id]);

const siguienteOrden = async () => {
  const fila = await consultarUna('SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente FROM personal');
  return Number(fila.siguiente);
};

module.exports = { listar, porId, crear, crearConId, actualizar, eliminar, siguienteOrden };
