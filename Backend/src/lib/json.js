/**
 * MariaDB guarda JSON como LONGTEXT: según la versión, el driver devuelve texto
 * o un objeto ya parseado. Estas dos funciones normalizan los dos casos.
 */
function leerJson(valor, porDefecto = null) {
  if (valor === null || valor === undefined) return porDefecto;
  if (typeof valor === 'object') return valor;
  try {
    return JSON.parse(valor);
  } catch {
    return porDefecto;
  }
}

function escribirJson(valor) {
  return JSON.stringify(valor ?? null);
}

module.exports = { leerJson, escribirJson };
