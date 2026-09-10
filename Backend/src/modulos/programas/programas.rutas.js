const { Router } = require('express');
const { exigirSesion } = require('../../middlewares/auth');
const { validar } = require('../../middlewares/validar');
const esquemas = require('./programas.esquemas');
const controlador = require('./programas.controlador');

const router = Router();

router.get('/programas', controlador.listar);

router.post('/admin/programas', exigirSesion, validar(esquemas.cuerpo), controlador.crear);
router.put('/admin/programas/:id', exigirSesion, validar(esquemas.cuerpo), controlador.actualizar);
router.delete('/admin/programas/:id', exigirSesion, controlador.eliminar);

module.exports = router;
