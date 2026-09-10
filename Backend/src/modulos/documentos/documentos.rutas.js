const { Router } = require('express');
const { exigirSesion } = require('../../middlewares/auth');
const { validar } = require('../../middlewares/validar');
const { parametroModulo } = require('../contenido/contenido.esquemas');
const esquemas = require('./documentos.esquemas');
const controlador = require('./documentos.controlador');

const router = Router();

router.get('/documentos', validar(esquemas.consulta, 'query'), controlador.listarPublico);

router.get('/admin/documentos', exigirSesion, validar(esquemas.consulta, 'query'), controlador.listarAdmin);
router.post('/admin/documentos', exigirSesion, validar(esquemas.cuerpo), controlador.crear);
router.put('/admin/documentos/:id', exigirSesion, validar(esquemas.cuerpo), controlador.actualizar);
router.delete('/admin/documentos/:id', exigirSesion, controlador.eliminar);

router.post(
  '/admin/documentos/restaurar/:modulo',
  exigirSesion,
  validar(parametroModulo, 'params'),
  controlador.restaurar,
);

module.exports = router;
