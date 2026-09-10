const { Router } = require('express');
const { validar } = require('../../middlewares/validar');
const { exigirSesion } = require('../../middlewares/auth');
const { limitadorLogin } = require('../../middlewares/limitador');
const esquemas = require('./auth.esquemas');
const controlador = require('./auth.controlador');

const router = Router();

router.post('/auth/login', limitadorLogin, validar(esquemas.login), controlador.login);
router.get('/auth/me', exigirSesion, controlador.yo);
router.post('/auth/logout', exigirSesion, controlador.logout);

// Cualquier rol puede cambiar SU contraseña. Gestionar las de otros sigue
// siendo cosa de /admin/usuarios, que exige rol admin.
router.put(
  '/auth/password',
  exigirSesion,
  validar(esquemas.cambiarClave),
  controlador.cambiarClave,
);

module.exports = router;
