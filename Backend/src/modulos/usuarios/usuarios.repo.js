const { consultar, consultarUna, ejecutar } = require('../../config/db');

const CAMPOS = 'id, nombre, username, email, rol, activo, ultimo_acceso, creado_en, actualizado_en';

const listar = () => consultar(`SELECT ${CAMPOS} FROM usuarios ORDER BY creado_en`);

const porId = (id) => consultarUna(`SELECT ${CAMPOS} FROM usuarios WHERE id = ? LIMIT 1`, [id]);

const crear = (u) =>
  ejecutar(
    `INSERT INTO usuarios (id, nombre, username, email, password_hash, rol, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [u.id, u.nombre, u.username, u.email, u.password_hash, u.rol, u.activo ? 1 : 0],
  );

const actualizar = (id, u) =>
  ejecutar(
    `UPDATE usuarios SET nombre = ?, username = ?, email = ?, rol = ?, activo = ? WHERE id = ?`,
    [u.nombre, u.username, u.email, u.rol, u.activo ? 1 : 0, id],
  );

const cambiarClave = (id, hash) =>
  ejecutar(
    'UPDATE usuarios SET password_hash = ?, password_actualizada_en = UTC_TIMESTAMP() WHERE id = ?',
    [hash, id],
  );

const eliminar = (id) => ejecutar('DELETE FROM usuarios WHERE id = ?', [id]);

const contarAdmins = async () => {
  const fila = await consultarUna("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'admin' AND activo = 1");
  return Number(fila.total);
};

module.exports = { listar, porId, crear, actualizar, cambiarClave, eliminar, contarAdmins };
