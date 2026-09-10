const { Router } = require('express');
const { exigirSesion } = require('../../middlewares/auth');
const { validar } = require('../../middlewares/validar');
const { recibirArchivo, validarArchivo } = require('../../middlewares/subida');
const esquemas = require('./repositorio.esquemas');
const controlador = require('./repositorio.controlador');

const router = Router();

router.get('/repositorio', controlador.listar);
router.get('/repositorio/:id', controlador.obtener);

router.post('/admin/repositorio', exigirSesion, validar(esquemas.cuerpo), controlador.crear);
router.put('/admin/repositorio/:id', exigirSesion, validar(esquemas.cuerpo), controlador.actualizar);
router.delete('/admin/repositorio/:id', exigirSesion, controlador.eliminar);
router.post(
  '/admin/repositorio/:id/archivo',
  exigirSesion,
  recibirArchivo('file'),
  validarArchivo(),
  controlador.adjuntar,
);

module.exports = router;
