/**
 * Becas y créditos (Ley N° 30512, rubro 8 del PTI).
 * El portal vivo no publica PDF ni relación del año; el tarifario sí está en INSTITUTION.
 */

export type BecasDocKind = 'relacion' | 'tasas' | 'consultas';

export interface BecasDoc {
  id: BecasDocKind;
  label: string;
}

export const BECAS_DOCS: readonly BecasDoc[] = [
  { id: 'relacion', label: 'Relación del año' },
  { id: 'tasas', label: 'Derechos y tasas' },
  { id: 'consultas', label: 'Consultas' },
];

export interface BecasContent {
  heroTitle: string;
  legalRubric: string;
  emptyTitle: string;
  emptyBody: string;
  cover: { src: string; alt: string };
  tasasLead: string;
}

export const BECAS_COPY: BecasContent = {
  heroTitle: 'Becas y créditos',
  legalRubric: 'Relación y número de becas y créditos educativos otorgados en el año en curso.',
  emptyTitle: 'Sin documentos publicados',
  emptyBody:
    'Este rubro del Portal de Transparencia aún no tiene una relación ni un PDF institucional en el sitio. Cuando el instituto la publique, aparecerá aquí.',
  cover: {
    src: 'assets/becas%20600x400.jpg',
    alt: 'Imagen del rubro Becas y créditos en el Portal de Transparencia Institucional',
  },
  tasasLead:
    'Las tasas de admisión, matrícula, pensión y reincorporación están publicadas en Costos. No son becas ni créditos educativos.',
};
