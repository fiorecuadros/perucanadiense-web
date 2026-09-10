/** Slug en minúsculas sin tildes; se usa para ids de noticias y tesis. */
function aSlug(texto, respaldo = 'elemento') {
  const base = String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
  return base || respaldo;
}

/**
 * Devuelve un slug libre. `existe` es una función async que dice si un id ya
 * está tomado; así el choque se resuelve en el servidor y no en el navegador.
 */
async function slugLibre(base, existe) {
  let candidato = aSlug(base);
  let intento = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await existe(candidato)) {
    candidato = `${aSlug(base)}-${intento}`;
    intento += 1;
  }
  return candidato;
}

module.exports = { aSlug, slugLibre };
