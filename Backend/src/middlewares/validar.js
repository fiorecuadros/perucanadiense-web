const { noProcesable } = require('../lib/errores');

/**
 * Valida `req.body` (o params/query) contra un esquema zod y **reemplaza** el
 * valor por el ya normalizado. A partir de aquí el controlador trabaja con
 * datos limpios; nunca con lo que llegó por la red.
 */
function validar(esquema, origen = 'body') {
  return (req, _res, next) => {
    const resultado = esquema.safeParse(req[origen]);
    if (!resultado.success) {
      const detalles = resultado.error.issues.map((incidencia) => ({
        campo: incidencia.path.join('.') || origen,
        mensaje: incidencia.message,
      }));
      return next(noProcesable('Revise los datos enviados.', detalles));
    }
    if (origen === 'body') req.body = resultado.data;
    else req.datosValidados = resultado.data;
    return next();
  };
}

module.exports = { validar };
