const { Router } = require('express');
const { exigirSesion } = require('../../middlewares/auth');
const { validar } = require('../../middlewares/validar');
const esquemas = require('./noticias.esquemas');
const controlador = require('./noticias.controlador');

const router = Router();

router.get('/noticias', controlador.listar);
router.get('/noticias/:id', controlador.obtener);

router.get('/admin/noticias', exigirSesion, controlador.listarAdmin);
router.post('/admin/noticias', exigirSesion, validar(esquemas.cuerpo), controlador.crear);
router.put('/admin/noticias/:id', exigirSesion, validar(esquemas.cuerpo), controlador.actualizar);
router.delete('/admin/noticias/:id', exigirSesion, controlador.eliminar);

module.exports = router;
