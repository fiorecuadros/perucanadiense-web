const { Router } = require('express');
const { exigirSesion } = require('../../middlewares/auth');
const { validar } = require('../../middlewares/validar');
const esquemas = require('./menu.esquemas');
const controlador = require('./menu.controlador');

const router = Router();

// El portal lo pide en cada carga, sin sesión: es la navegación del sitio.
router.get('/menu', controlador.listarPublico);

router.get('/admin/menu', exigirSesion, controlador.listarAdmin);
router.post('/admin/menu', exigirSesion, validar(esquemas.cuerpo), controlador.crear);

// Antes que `/:id`, o "orden" y "restaurar" se leerían como identificadores.
router.put('/admin/menu/orden', exigirSesion, validar(esquemas.orden), controlador.reordenar);
router.post('/admin/menu/restaurar', exigirSesion, controlador.restaurar);

router.put('/admin/menu/:id', exigirSesion, validar(esquemas.cuerpo), controlador.actualizar);
router.delete('/admin/menu/:id', exigirSesion, controlador.eliminar);

module.exports = router;
