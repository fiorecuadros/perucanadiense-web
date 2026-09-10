const { Router } = require('express');
const { z } = require('zod');
const { exigirSesion } = require('../../middlewares/auth');
const { validar } = require('../../middlewares/validar');
const asincrono = require('../../lib/asincrono');
const { consultarUna, ejecutar } = require('../../config/db');
const { leerJson, escribirJson } = require('../../lib/json');
const { registrar } = require('../../lib/auditoria');

const router = Router();

/**
 * Ficha institucional: identidad, sedes, contacto, tarifas y cuentas bancarias.
 * Una sola fila JSON (`institucion.id = 1`). La forma la define
 * `institution.constant.ts`. Se edita desde /admin/contactos y los montos
 * también desde /admin/costos. Si la fila viva no trae un campo, se rellena
 * con la semilla para no dejar el portal sin RUC, tarifas o cuentas.
 */
const cuerpo = z.record(z.unknown()).refine((v) => v !== null && !Array.isArray(v), {
  message: 'La ficha institucional debe ser un objeto.',
});

async function leer() {
  const semilla = await consultarUna("SELECT data FROM semillas WHERE clave = 'institucion' LIMIT 1");
  const oficial = semilla ? leerJson(semilla.data, {}) : {};
  const fila = await consultarUna('SELECT data FROM institucion WHERE id = 1 LIMIT 1');
  const viva = fila ? leerJson(fila.data, {}) : {};
  return { ...oficial, ...viva };
}

router.get(
  '/institucion',
  asincrono(async (_req, res) => res.json(await leer())),
);

router.put(
  '/admin/institucion',
  exigirSesion,
  validar(cuerpo),
  asincrono(async (req, res) => {
    await ejecutar(
      `INSERT INTO institucion (id, data, actualizado_por) VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data), actualizado_por = VALUES(actualizado_por)`,
      [escribirJson(req.body), req.usuario.id],
    );
    await registrar(req, { accion: 'actualizar', entidad: 'institucion', entidadId: '1' });
    res.json(await leer());
  }),
);

module.exports = router;
