const { Router } = require('express');
const { exigirSesion, exigirRol } = require('../../middlewares/auth');
const { validar } = require('../../middlewares/validar');
const esquemas = require('./usuarios.esquemas');
const controlador = require('./usuarios.controlador');

const router = Router();

// Gestionar cuentas es cosa de administradores, no de editores.
router.use('/admin/usuarios', exigirSesion, exigirRol('admin'));

router.get('/admin/usuarios', controlador.listar);
router.post('/admin/usuarios', validar(esquemas.crear), controlador.crear);
router.get('/admin/usuarios/:id', controlador.obtener);
router.put('/admin/usuarios/:id', validar(esquemas.actualizar), controlador.actualizar);
router.delete('/admin/usuarios/:id', controlador.eliminar);

module.exports = router;
