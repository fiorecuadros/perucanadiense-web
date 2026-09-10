const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { consultarUna } = require('../config/db');
const { noAutorizado, prohibido } = require('../lib/errores');

function leerToken(req) {
  const cabecera = req.headers.authorization || '';
  if (!cabecera.startsWith('Bearer ')) return null;
  const token = cabecera.slice(7).trim();
  return token || null;
}

/**
 * Exige un token válido y carga el usuario. Comprueba además que el token se
 * haya emitido DESPUÉS del último cambio de contraseña: así cambiar la clave
 * cierra las sesiones abiertas sin mantener una lista negra.
 */
async function exigirSesion(req, _res, next) {
  try {
    const token = leerToken(req);
    if (!token) throw noAutorizado();

    let datos;
    try {
      datos = jwt.verify(token, env.jwt.secreto);
    } catch {
      throw noAutorizado('Token inválido o expirado.');
    }

    const usuario = await consultarUna(
      `SELECT id, nombre, username, rol, activo,
              UNIX_TIMESTAMP(password_actualizada_en) AS clave_cambiada
         FROM usuarios WHERE id = ? LIMIT 1`,
      [datos.sub],
    );

    if (!usuario || !usuario.activo) throw noAutorizado('La sesión ya no es válida.');
    if (datos.iat && Number(usuario.clave_cambiada) > Number(datos.iat)) {
      throw noAutorizado('La contraseña cambió: inicie sesión de nuevo.');
    }

    req.usuario = { id: usuario.id, nombre: usuario.nombre, username: usuario.username, rol: usuario.rol };
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Sesión opcional: si viene un token válido deja `req.usuario`, y si no viene
 * (o no vale) sigue como anónimo sin cortar la petición. Lo usa la descarga de
 * archivos, que atiende al portal público y al panel por la misma ruta.
 */
async function sesionOpcional(req, _res, next) {
  if (!leerToken(req)) return next();
  try {
    await exigirSesion(req, _res, (error) => {
      if (error) req.usuario = undefined;
      next();
    });
  } catch {
    req.usuario = undefined;
    next();
  }
}

/** Restringe a ciertos roles. `exigirRol('admin')` para gestión de usuarios. */
function exigirRol(...roles) {
  return (req, _res, next) => {
    if (!req.usuario) return next(noAutorizado());
    if (!roles.includes(req.usuario.rol)) {
      return next(prohibido(`Se requiere rol ${roles.join(' o ')}.`));
    }
    return next();
  };
}

module.exports = { exigirSesion, sesionOpcional, exigirRol };
