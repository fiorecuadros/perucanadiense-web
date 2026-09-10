/**
 * Licenciamiento institucional. Identidad: INSTITUTION.
 * El PTI rubro 10 no publica periodo de vigencia; el organigrama sí embebe RVM-097-2022-MINEDU.
 */

export type LicenciamientoDocKind = 'identidad' | 'norma' | 'carreras' | 'consultas';

export interface LicenciamientoDoc {
  id: LicenciamientoDocKind;
  label: string;
}

export const LICENCIAMIENTO_DOCS: readonly LicenciamientoDoc[] = [
  { id: 'identidad', label: 'Identidad legal' },
  { id: 'norma', label: 'RVM-097-2022-MINEDU' },
  { id: 'carreras', label: 'Carreras FID' },
  { id: 'consultas', label: 'Consultas' },
];

export interface LicenciamientoContent {
  heroTitle: string;
  identityLead: string;
  rumboNote: string;
  recognitionNorm: string;
  legalRubric: string;
  emptyTitle: string;
  emptyBody: string;
  rvmUrl: string;
  rvmLabel: string;
  cover: { src: string; alt: string };
  carrerasLead: string;
}

export const LICENCIAMIENTO_COPY: LicenciamientoContent = {
  heroTitle: 'Licenciamiento',
  identityLead:
    'Instituto de Educación Superior Pedagógico Privado, autorizado por el Ministerio de Educación. No es universidad ni instituto público; el rectorado es MINEDU / DIFOID / DIGEDD y la DREL, no SUNEDU.',
  rumboNote:
    'El portal institucional usa el lema «Rumbo al Licenciamiento» en el marco de la adecuación como Escuela de Educación Superior Pedagógica. Eso no sustituye la autorización vigente como instituto pedagógico privado.',
  recognitionNorm: 'R.D.R.S. N° 2643-2010-GR-LAM/DREL',
  legalRubric: 'Periodo de vigencia de su licenciamiento.',
  emptyTitle: 'Sin periodo publicado en el PTI',
  emptyBody:
    'El rubro 10 del Portal de Transparencia no tiene un PDF con el periodo de vigencia. El instituto sí publica la RVM-097-2022-MINEDU en el organigrama.',
  rvmUrl: '/docs/RVM-097-2022-MINEDU.pdf',
  rvmLabel: 'Abrir RVM-097-2022-MINEDU',
  cover: {
    src: 'images/pcanadiense/licenciamiento.jpg',
    alt: 'Ficha de licenciamiento MINEDU del IESPP Peruano Canadiense',
  },
  carrerasLead:
    'Programas de Formación Inicial Docente con resolución viceministerial publicada. Las carreras técnicas se autorizan por la R.D.R.S. N° 2643-2010-GR-LAM/DREL.',
};
