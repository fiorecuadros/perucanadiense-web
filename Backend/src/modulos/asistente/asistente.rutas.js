const { Router } = require('express');
const { validar } = require('../../middlewares/validar');
const { limitadorAsistente } = require('../../middlewares/limitador');
const esquemas = require('./asistente.esquemas');
const controlador = require('./asistente.controlador');

const router = Router();

router.post('/asistente', limitadorAsistente, validar(esquemas.consulta), controlador.consultar);

module.exports = router;
