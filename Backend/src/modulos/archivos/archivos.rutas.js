const { Router } = require('express');
const { exigirSesion, sesionOpcional } = require('../../middlewares/auth');
const { recibirArchivo, validarArchivo } = require('../../middlewares/subida');
const controlador = require('./archivos.controlador');

const router = Router();

// Los documentos del portal se enlazan sin sesión; los adjuntos de un trámite
// llevan datos personales y exigen estar dentro del panel. El controlador
// decide según la visibilidad del archivo, por eso la sesión es opcional aquí.
router.get('/archivos/:id', sesionOpcional, controlador.descargar);

router.post('/archivos', exigirSesion, recibirArchivo('file'), validarArchivo(), controlador.subir);
router.delete('/archivos/:id', exigirSesion, controlador.eliminar);

module.exports = router;
