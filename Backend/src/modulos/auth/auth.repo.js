const { consultarUna, ejecutar } = require('../../config/db');

const porCredencial = (credencial) =>
  consultarUna(
    `SELECT id, nombre, username, email, password_hash, rol, activo
       FROM usuarios
      WHERE (username = ? OR email = ?) LIMIT 1`,
    [credencial, credencial],
  );

const marcarAcceso = (id) => ejecutar('UPDATE usuarios SET ultimo_acceso = UTC_TIMESTAMP() WHERE id = ?', [id]);

const porId = (id) =>
  consultarUna('SELECT id, nombre, username, password_hash, rol, activo FROM usuarios WHERE id = ? LIMIT 1', [id]);

/**
 * `password_actualizada_en` es lo que invalida los tokens emitidos antes: el
 * middleware de sesión los rechaza. Cambiar la clave cierra las sesiones
 * abiertas, incluida la de quien la está cambiando.
 */
const cambiarClave = (id, hash) =>
  ejecutar(
    'UPDATE usuarios SET password_hash = ?, password_actualizada_en = UTC_TIMESTAMP() WHERE id = ?',
    [hash, id],
  );

module.exports = { porCredencial, porId, marcarAcceso, cambiarClave };
