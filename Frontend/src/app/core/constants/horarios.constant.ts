/**
 * Horarios institucionales. Afiche 2026 y franjas de INSTITUTION.schedule.
 * No hay grilla semanal por programa en el portal vivo.
 */

export type HorariosDocKind = 'atencion' | 'clases' | 'consultas';

export interface HorariosDoc {
  id: HorariosDocKind;
  label: string;
  kind: 'image' | 'panel';
  src?: string;
  alt?: string;
}

export const HORARIOS_DOCS: readonly HorariosDoc[] = [
  {
    id: 'atencion',
    label: 'Atención al público',
    kind: 'image',
    src: 'images/pcanadiense/horario_atencion_2026v2.png',
    alt: 'Afiche de horarios de atención al público del IESPP Peruano Canadiense',
  },
  { id: 'clases', label: 'Clases presenciales', kind: 'panel' },
  { id: 'consultas', label: 'Consultas', kind: 'panel' },
];

export interface HorariosContent {
  heroTitle: string;
  clasesLead: string;
  clasesEmpty: string;
  workingNote: string;
}

export const HORARIOS_COPY: HorariosContent = {
  heroTitle: 'Horarios',
  clasesLead:
    'Clases presenciales de Formación Inicial Docente, con soporte sincrónico y asincrónico en Microsoft Teams.',
  clasesEmpty:
    'El instituto no publicó una grilla semanal por programa. El horario de clases vigente es el de esta sección.',
  workingNote:
    'El portal institucional presenta estos horarios como compatibles con personas que trabajan.',
};
