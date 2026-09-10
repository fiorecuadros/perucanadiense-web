/**
 * Inversiones y reinversiones (Ley N° 30512, rubro 9 del PTI).
 * El portal vivo no publica PDF ni informe; el campus sí está descrito en historia.
 */

export type InversionesDocKind = 'informe' | 'campus' | 'consultas';

export interface InversionesDoc {
  id: InversionesDocKind;
  label: string;
}

export const INVERSIONES_DOCS: readonly InversionesDoc[] = [
  { id: 'informe', label: 'Informe del PTI' },
  { id: 'campus', label: 'Campus e infraestructura' },
  { id: 'consultas', label: 'Consultas' },
];

export interface InversionesContent {
  heroTitle: string;
  legalRubric: string;
  emptyTitle: string;
  emptyBody: string;
  cover: { src: string; alt: string };
  campusLead: string;
  /** Infraestructura del campus (HTML enriquecido). Antes era un arreglo de textos. */
  facilitiesText: string;
}

export const INVERSIONES_COPY: InversionesContent = {
  heroTitle: 'Inversiones',
  legalRubric:
    'Inversiones, reinversiones, donaciones, obras de infraestructura, recursos de diversa índole que reciba, cualquiera sea su origen o naturaleza, y los fines a que se destinan.',
  emptyTitle: 'Sin documentos publicados',
  emptyBody:
    'Este rubro del Portal de Transparencia aún no tiene un informe ni un PDF institucional en el sitio. Cuando el instituto lo publique, aparecerá aquí.',
  cover: {
    src: 'images/pcanadiense/reinversiones.jpg',
    alt: 'Imagen del rubro Inversiones y reinversiones en el Portal de Transparencia Institucional',
  },
  campusLead:
    'Descripción publicada del campus: área de construcción, biblioteca, auditorio, sala de audiovisuales, taller de computación y áreas verdes, además del colegio de aplicación de secundaria. No sustituye el informe de inversiones del PTI.',
  facilitiesText:
    '<ul><li>Biblioteca</li><li>Auditorio</li><li>Sala de audiovisuales</li>' +
    '<li>Taller de computación</li><li>Áreas verdes</li>' +
    '<li>Colegio de aplicación de educación secundaria</li></ul>',
};
