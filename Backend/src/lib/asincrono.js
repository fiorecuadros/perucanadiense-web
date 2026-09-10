/**
 * Envuelve un controlador async para que un rechazo llegue al manejador de
 * errores de Express. Evita el try/catch repetido en cada método.
 */
module.exports = function asincrono(controlador) {
  return (req, res, next) => Promise.resolve(controlador(req, res, next)).catch(next);
};
