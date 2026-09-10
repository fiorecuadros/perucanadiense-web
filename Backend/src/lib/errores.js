/**
 * Error con código HTTP. El manejador central lo convierte en respuesta;
 * cualquier otro error se responde como 500 sin filtrar el detalle interno.
 */
class ErrorHttp extends Error {
  constructor(estado, mensaje, detalles) {
    super(mensaje);
    this.name = 'ErrorHttp';
    this.estado = estado;
    if (detalles) this.detalles = detalles;
  }
}

const solicitudInvalida = (m = 'Solicitud inválida.', d) => new ErrorHttp(400, m, d);
const noAutorizado = (m = 'Token requerido.') => new ErrorHttp(401, m);
const prohibido = (m = 'No tiene permisos para esta operación.') => new ErrorHttp(403, m);
const noEncontrado = (m = 'Recurso no encontrado.') => new ErrorHttp(404, m);
const conflicto = (m = 'El recurso ya existe.') => new ErrorHttp(409, m);
const noProcesable = (m = 'Datos inválidos.', d) => new ErrorHttp(422, m, d);
const demasiadoGrande = (m = 'El archivo excede el tamaño permitido.') => new ErrorHttp(413, m);
const tipoNoSoportado = (m = 'Tipo de archivo no permitido.') => new ErrorHttp(415, m);

module.exports = {
  ErrorHttp,
  solicitudInvalida,
  noAutorizado,
  prohibido,
  noEncontrado,
  conflicto,
  noProcesable,
  demasiadoGrande,
  tipoNoSoportado,
};
