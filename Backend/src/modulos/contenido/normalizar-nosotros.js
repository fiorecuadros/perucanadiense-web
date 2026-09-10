/**
 * El panel de Nosotros dejó las listas `values` / `milestones` y ahora guarda
 * HTML en `valuesText` / `historyTimeline`. La fila viva puede seguir en el
 * formato anterior: GET/PUT normalizan para que el portal público no hidrate
 * un objeto sin esos campos.
 */

const TAG_RE = /<[^>]+>/g;
const WS_RE = /\s+/g;

function escapar(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function htmlVacio(html) {
  return !String(html ?? '')
    .replace(TAG_RE, ' ')
    .replace(WS_RE, ' ')
    .trim();
}

function valoresAHtml(values) {
  if (!Array.isArray(values) || !values.length) return '';
  return `<ul>${values
    .map(
      (valor) =>
        `<li><strong>${escapar(valor && valor.name)}.</strong> ${escapar(valor && valor.definition)}</li>`,
    )
    .join('')}</ul>`;
}

function hitosAHtml(milestones) {
  if (!Array.isArray(milestones) || !milestones.length) return '';
  return `<ul>${milestones
    .map(
      (hito) =>
        `<li><strong>${escapar(hito && hito.year)} · ${escapar(hito && hito.title)}.</strong> ${escapar(hito && hito.text)}</li>`,
    )
    .join('')}</ul>`;
}

function textoEnriquecido(actual, legado, convertir) {
  const html = typeof actual === 'string' ? actual : undefined;
  if (html !== undefined && !htmlVacio(html)) return html;
  if (Array.isArray(legado) && legado.length) return convertir(legado);
  if (html !== undefined) return html;
  return '';
}

function normalizarNosotros(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const { values, milestones, ...resto } = raw;
  const valuesText = textoEnriquecido(raw.valuesText, values, valoresAHtml);
  const historyTimeline = textoEnriquecido(raw.historyTimeline, milestones, hitosAHtml);
  return { ...resto, valuesText, historyTimeline };
}

module.exports = { normalizarNosotros };
