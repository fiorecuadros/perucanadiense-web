/**
 * Correo opcional. Regla del proyecto: un trámite NO se pierde porque el SMTP
 * esté caído. Si el envío falla se registra en consola y la solicitud sigue su
 * curso; el registro ya está en la base y el panel lo verá igual.
 */
const nodemailer = require('nodemailer');
const env = require('./../config/env');

let transporte = null;

function obtenerTransporte() {
  if (!env.correo.habilitado) return null;
  if (transporte) return transporte;
  transporte = nodemailer.createTransport({
    host: env.correo.host,
    port: env.correo.puerto,
    secure: env.correo.seguro,
    auth: env.correo.usuario ? { user: env.correo.usuario, pass: env.correo.clave } : undefined,
  });
  return transporte;
}

/** Nunca lanza: devuelve true si se envió. */
async function enviar({ para, asunto, html, texto }) {
  const cliente = obtenerTransporte();
  if (!cliente) return false;
  try {
    await cliente.sendMail({
      from: env.correo.remitente,
      to: para || env.correo.receptor,
      subject: asunto,
      html,
      text: texto,
    });
    return true;
  } catch (error) {
    console.error('[correo] no se pudo enviar:', error.message);
    return false;
  }
}

module.exports = { enviar };
