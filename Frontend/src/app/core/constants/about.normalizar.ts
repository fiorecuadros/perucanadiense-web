import { htmlVacio, escapeHtml } from '../utils/html';
import { ABOUT_COPY, type AboutContent } from './about.constant';

interface ValorLegacy {
  name?: unknown;
  definition?: unknown;
}

interface HitoLegacy {
  year?: unknown;
  title?: unknown;
  text?: unknown;
}

interface NosotrosLegacy extends Partial<AboutContent> {
  values?: ValorLegacy[];
  milestones?: HitoLegacy[];
}

function texto(valor: unknown, respaldo: string): string {
  return typeof valor === 'string' ? valor : respaldo;
}

function valoresAHtml(values: ValorLegacy[]): string {
  if (!values.length) return '';
  const items = values.map((valor) => {
    const nombre = escapeHtml(String(valor?.name ?? ''));
    const definicion = escapeHtml(String(valor?.definition ?? ''));
    return `<li><strong>${nombre}.</strong> ${definicion}</li>`;
  });
  return `<ul>${items.join('')}</ul>`;
}

function hitosAHtml(milestones: HitoLegacy[]): string {
  if (!milestones.length) return '';
  const items = milestones.map((hito) => {
    const anio = escapeHtml(String(hito?.year ?? ''));
    const titulo = escapeHtml(String(hito?.title ?? ''));
    const detalle = escapeHtml(String(hito?.text ?? ''));
    return `<li><strong>${anio} · ${titulo}.</strong> ${detalle}</li>`;
  });
  return `<ul>${items.join('')}</ul>`;
}

function textoEnriquecido<T>(
  actual: unknown,
  legado: T[] | undefined,
  convertir: (items: T[]) => string,
  respaldo: string,
): string {
  const html = typeof actual === 'string' ? actual : undefined;
  if (html !== undefined && !htmlVacio(html)) return html;
  if (Array.isArray(legado) && legado.length) return convertir(legado);
  if (html !== undefined) return html;
  return respaldo;
}

/**
 * El panel de Nosotros pasó de listas estructuradas (`values`, `milestones`) a
 * HTML enriquecido (`valuesText`, `historyTimeline`). La fila viva de la BD
 * puede seguir en el formato anterior: sin esta conversión el portal público
 * hidrata un objeto sin esos campos y Valores / «Ver más» quedan vacíos.
 */
export function normalizarNosotros(raw: unknown): AboutContent {
  const semilla = structuredClone(ABOUT_COPY);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return semilla;
  }

  const d = raw as NosotrosLegacy;
  const resto = { ...d };
  delete resto.values;
  delete resto.milestones;

  return {
    ...semilla,
    ...resto,
    heroTitle: texto(d.heroTitle, semilla.heroTitle),
    heroLead: texto(d.heroLead, semilla.heroLead),
    mission: texto(d.mission, semilla.mission),
    vision: texto(d.vision, semilla.vision),
    historyLead: texto(d.historyLead, semilla.historyLead),
    organigrama: {
      src: texto(d.organigrama?.src, semilla.organigrama.src),
      alt: texto(d.organigrama?.alt, semilla.organigrama.alt),
    },
    historiaImage: {
      src: texto(d.historiaImage?.src, semilla.historiaImage.src),
      alt: texto(d.historiaImage?.alt, semilla.historiaImage.alt),
    },
    valuesText: textoEnriquecido(d.valuesText, d.values, valoresAHtml, semilla.valuesText),
    historyTimeline: textoEnriquecido(
      d.historyTimeline,
      d.milestones,
      hitosAHtml,
      semilla.historyTimeline,
    ),
  };
}
