const { Router } = require('express');
const { exigirSesion } = require('../../middlewares/auth');
const { validar } = require('../../middlewares/validar');
const { recibirArchivo, validarArchivo } = require('../../middlewares/subida');
const { limitadorTramites, limitadorSeguimiento } = require('../../middlewares/limitador');
const esquemas = require('./tramites.esquemas');
const controlador = require('./tramites.controlador');

const router = Router();

// ------------------------------------------------------------------ público
// El adjunto es opcional: hoy el frontend manda JSON con el nombre del archivo;
// cuando envíe FormData, `recibirArchivo` lo captura sin cambiar la ruta.
router.post(
  '/tramites/mesa-de-partes',
  limitadorTramites,
  recibirArchivo('file'),
  validarArchivo({ obligatorio: false }),
  validar(esquemas.mesaDePartes),
  controlador.crearMesa,
);

router.get('/tramites/mesa-de-partes/:codigo', limitadorSeguimiento, controlador.seguir('mesa'));

router.post('/tramites/reclamaciones', limitadorTramites, validar(esquemas.reclamacion), controlador.crearSimple('reclamaciones'));
router.get('/tramites/reclamaciones/:codigo', limitadorSeguimiento, controlador.seguir('reclamaciones'));
router.post('/tramites/acceso-informacion', limitadorTramites, validar(esquemas.accesoInformacion), controlador.crearSimple('acceso'));
router.post('/tramites/psicopedagogico', limitadorTramites, validar(esquemas.citaPsicopedagogica), controlador.crearSimple('psico'));
router.post('/tramites/servicio-social', limitadorTramites, validar(esquemas.apoyoSocial), controlador.crearSimple('social'));

router.post(
  '/tramites/accesibilidad',
  limitadorTramites,
  validar(esquemas.reporteAccesibilidad),
  controlador.crearSimple('accesibilidad'),
);

// -------------------------------------------------------------------- panel
router.use('/admin/mesa-de-partes', exigirSesion);
router.use('/admin/reclamaciones', exigirSesion);
router.use('/admin/acceso-informacion', exigirSesion);
router.use('/admin/citas-psicopedagogicas', exigirSesion);
router.use('/admin/servicio-social', exigirSesion);
router.use('/admin/reportes-accesibilidad', exigirSesion);
router.use('/admin/tramites', exigirSesion);

router.get('/admin/mesa-de-partes', controlador.listar('mesa'));
router.get('/admin/mesa-de-partes/:id', controlador.obtener('mesa'));
router.put('/admin/mesa-de-partes/:id', validar(esquemas.actualizacionAdmin), controlador.actualizar('mesa'));

router.get('/admin/reclamaciones', controlador.listar('reclamaciones'));
router.get('/admin/reclamaciones/:id', controlador.obtener('reclamaciones'));
router.put('/admin/reclamaciones/:id', validar(esquemas.actualizacionAdmin), controlador.actualizar('reclamaciones'));

router.get('/admin/acceso-informacion', controlador.listar('acceso'));
router.put('/admin/acceso-informacion/:id', validar(esquemas.actualizacionAdmin), controlador.actualizar('acceso'));

router.get('/admin/citas-psicopedagogicas', controlador.listar('psico'));
router.put('/admin/citas-psicopedagogicas/:id', validar(esquemas.actualizacionAdmin), controlador.actualizar('psico'));

router.get('/admin/servicio-social', controlador.listar('social'));
router.put('/admin/servicio-social/:id', validar(esquemas.actualizacionAdmin), controlador.actualizar('social'));

router.get('/admin/reportes-accesibilidad', controlador.listar('accesibilidad'));
router.get('/admin/reportes-accesibilidad/:id', controlador.obtener('accesibilidad'));
router.put('/admin/reportes-accesibilidad/:id', validar(esquemas.actualizacionAdmin), controlador.actualizar('accesibilidad'));

router.get('/admin/tramites/resumen', controlador.resumen);

module.exports = router;


