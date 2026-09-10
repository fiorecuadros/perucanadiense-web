const { Router } = require('express');
const { exigirSesion } = require('../../middlewares/auth');
const { validar } = require('../../middlewares/validar');
const esquemas = require('./personal.esquemas');
const controlador = require('./personal.controlador');

const router = Router();

router.get('/personal', controlador.listar);

router.post('/admin/personal', exigirSesion, validar(esquemas.cuerpo), controlador.crear);
router.put('/admin/personal/:id', exigirSesion, validar(esquemas.cuerpo), controlador.actualizar);
router.delete('/admin/personal/:id', exigirSesion, controlador.eliminar);

module.exports = router;
