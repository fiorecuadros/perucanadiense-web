const asincrono = require('../../lib/asincrono');
const servicio = require('./asistente.servicio');

const consultar = asincrono(async (req, res) => {
  res.json(await servicio.consultar(req.body.mensaje));
});

module.exports = { consultar };
