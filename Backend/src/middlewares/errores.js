const multer = require('multer');
const env = require('../config/env');
const { ErrorHttp } = require('../lib/errores');

function noEncontrado(req, _res, next) {
  next(new ErrorHttp(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

/**
 * Único lugar donde un error se convierte en respuesta. Los errores esperados
 * llevan su código; el resto sale como 500 con el detalle solo en el log.
 */
// eslint-disable-next-line no-unused-vars
function manejarErrores(error, req, res, _next) {
  if (error instanceof multer.MulterError) {
    const estado = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(estado).json({ message: traducirMulter(error) });
  }

  if (error instanceof ErrorHttp) {
    const cuerpo = { message: error.message };
    if (error.detalles) cuerpo.detalles = error.detalles;
    return res.status(error.estado).json(cuerpo);
  }

  if (error && error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Ya existe un registro con esos datos.' });
  }

  console.error(`[error] ${req.method} ${req.originalUrl}:`, paraRegistro(error));
  return res.status(500).json({
    message: 'Error interno del servidor. Inténtelo de nuevo más tarde.',
    ...(env.produccion ? {} : { detalle: error.message }),
  });
}

/**
 * Un error de mysql2 lleva en `sql` la consulta con sus valores ya sustituidos:
 * volcarlo tal cual escribe el DNI, el correo y el texto del trámite en el log
 * del servidor, que se rota y entra en las copias de seguridad. Se conserva lo
 * que sirve para depurar (código, mensaje del motor, la tabla) y se quita el
 * resto. `sqlMessage` puede citar un valor en un choque de clave única, así que
 * también se recorta.
 */
function paraRegistro(error) {
  if (!error || !error.sql) return error;
  const { sql, sqlMessage, parameters, values, ...resto } = error;
  return Object.assign(Object.create(Object.getPrototypeOf(error)), resto, {
    message: error.message,
    stack: error.stack,
    sqlMessage: typeof sqlMessage === 'string' ? sqlMessage.slice(0, 120) : sqlMessage,
    sql: `[omitido: ${String(sql).slice(0, 40).replace(/\s+/g, ' ')}…]`,
  });
}

function traducirMulter(error) {
  if (error.code === 'LIMIT_FILE_SIZE') return 'El archivo excede el tamaño permitido.';
  if (error.code === 'LIMIT_UNEXPECTED_FILE') return `Campo de archivo inesperado: ${error.field}.`;
  return 'No se pudo procesar el archivo enviado.';
}

module.exports = { noEncontrado, manejarErrores };
