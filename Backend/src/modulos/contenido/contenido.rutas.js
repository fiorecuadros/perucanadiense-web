const { Router } = require('express');
const { exigirSesion } = require('../../middlewares/auth');
const { validar } = require('../../middlewares/validar');
const esquemas = require('./contenido.esquemas');
const controlador = require('./contenido.controlador');

const router = Router();
const validarModulo = validar(esquemas.parametroModulo, 'params');

router.get('/contenido/:modulo', validarModulo, controlador.obtener);

router.put(
  '/admin/contenido/:modulo',
  exigirSesion,
  validarModulo,
  validar(esquemas.cuerpoContenido),
  controlador.guardar,
);

// Sin esta ruta, el botón "Restaurar original" del panel solo limpia el navegador.
router.post('/admin/contenido/:modulo/restaurar', exigirSesion, validarModulo, controlador.restaurar);

router.get('/admin/contenido/:modulo/versiones', exigirSesion, validarModulo, controlador.versiones);
router.get(
  '/admin/contenido/:modulo/versiones/:id',
  exigirSesion,
  validar(esquemas.parametroVersion, 'params'),
  controlador.version,
);
router.post(
  '/admin/contenido/:modulo/versiones/:id/restaurar',
  exigirSesion,
  validar(esquemas.parametroVersion, 'params'),
  controlador.restaurarVersion,
);

module.exports = router;
