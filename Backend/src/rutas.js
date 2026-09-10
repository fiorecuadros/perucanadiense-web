const { Router } = require('express');

const auth = require('./modulos/auth/auth.rutas');
const archivos = require('./modulos/archivos/archivos.rutas');
const contenido = require('./modulos/contenido/contenido.rutas');
const documentos = require('./modulos/documentos/documentos.rutas');
const noticias = require('./modulos/noticias/noticias.rutas');
const personal = require('./modulos/personal/personal.rutas');
const repositorio = require('./modulos/repositorio/repositorio.rutas');
const institucion = require('./modulos/institucion/institucion.rutas');
const menu = require('./modulos/menu/menu.rutas');
const programas = require('./modulos/programas/programas.rutas');
const tramites = require('./modulos/tramites/tramites.rutas');
const asistente = require('./modulos/asistente/asistente.rutas');
const usuarios = require('./modulos/usuarios/usuarios.rutas');
const panel = require('./modulos/panel/panel.rutas');

const router = Router();

router.get('/salud', (_req, res) =>
  res.json({ ok: true, servicio: 'pcanadiense-api', fecha: new Date().toISOString() }),
);

router.use(auth);
router.use(archivos);
router.use(contenido);
router.use(documentos);
router.use(noticias);
router.use(personal);
router.use(repositorio);
router.use(institucion);
router.use(menu);
router.use(programas);
router.use(tramites);
router.use(asistente);
router.use(usuarios);
router.use(panel);

module.exports = router;
