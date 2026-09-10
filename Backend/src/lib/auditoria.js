const crypto = require('crypto');
const { ejecutar } = require('../config/db');
const { escribirJson } = require('./json');

/**
 * Deja constancia de quién tocó qué. El Portal de Transparencia es una
 * obligación legal: hay que poder responder quién publicó o retiró un documento.
 * Nunca interrumpe la operación principal.
 */
async function registrar(req, { accion, entidad, entidadId = null, datos = null }) {
  try {
    await ejecutar(
      `INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, datos, ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.usuario ? req.usuario.id : null,
        accion,
        entidad,
        entidadId === null ? null : String(entidadId),
        datos ? escribirJson(datos) : null,
        req.ip ? String(req.ip).slice(0, 45) : null,
      ],
    );
  } catch (error) {
    console.error('[auditoria] no se pudo registrar:', error.message);
  }
}

const nuevoId = () => crypto.randomUUID();

module.exports = { registrar, nuevoId };
