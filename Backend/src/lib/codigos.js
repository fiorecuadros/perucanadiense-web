const crypto = require('crypto');

/**
 * Códigos de seguimiento con el mismo formato que ya usa el frontend en modo
 * local (MDP-, REC-, ACC-, CITA-, SS-), pero con azar criptográfico: los del
 * navegador salen de Date.now() y son adivinables.
 */
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I, O, 0, 1

function sufijo(largo = 9) {
  const bytes = crypto.randomBytes(largo);
  let salida = '';
  for (let i = 0; i < largo; i += 1) {
    salida += ALFABETO[bytes[i] % ALFABETO.length];
  }
  return salida;
}

const generarCodigo = (prefijo, largo = 9) => `${prefijo}-${sufijo(largo)}`;

module.exports = { generarCodigo };
