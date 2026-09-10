/**
 * La base devuelve texto ('2026-09-02 14:03:11' en UTC, o '2026-09-02' para DATE).
 * El contrato del Angular pide ISO en `actualizadoEn` / `submittedAt` y
 * 'YYYY-MM-DD' en `createdAt` de noticias.
 */

/** '2026-09-02 14:03:11' (UTC) → '2026-09-02T14:03:11.000Z' */
function aIso(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor.toISOString();
  const texto = String(valor).trim();
  if (!texto) return null;
  if (texto.includes('T')) return new Date(texto).toISOString();
  return new Date(`${texto.replace(' ', 'T')}Z`).toISOString();
}

/** Cualquier fecha → 'YYYY-MM-DD' */
function aFechaCorta(valor) {
  if (!valor) return null;
  const texto = String(valor);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
  const iso = aIso(texto);
  return iso ? iso.slice(0, 10) : null;
}

/** Ahora en formato DATETIME de MySQL, en UTC. */
function ahoraSql() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

/** ISO o 'YYYY-MM-DD' → DATETIME de MySQL en UTC (null si no es válida). */
function aSql(valor) {
  if (!valor) return null;
  const fecha = new Date(String(valor).length === 10 ? `${valor}T00:00:00Z` : valor);
  if (Number.isNaN(fecha.getTime())) return null;
  return fecha.toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = { aIso, aFechaCorta, ahoraSql, aSql };
