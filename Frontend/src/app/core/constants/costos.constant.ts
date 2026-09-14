/**
 * Costos y derechos (Ley N° 30512, rubro 2 del PTI).
 * Tarifas y cuentas: INSTITUTION. El PDF del PTI vive en SharePoint, no en el repo.
 */

export type CostosDocKind = 'tarifario' | 'matricula' | 'consultas';

export interface CostosDoc {
  id: CostosDocKind;
  label: string;
}

export const COSTOS_DOCS: readonly CostosDoc[] = [
  { id: 'tarifario', label: 'Tarifario' },
  { id: 'matricula', label: 'Matrícula' },
  { id: 'consultas', label: 'Consultas' },
];

export interface CostosContent {
  heroTitle: string;
  legalRubric: string;
  tarifarioLead: string;
  tarifarioUrl: string;
  cover: { src: string; alt: string };
  matriculaImage: { src: string; alt: string };
  matriculaLead: string;
  /** Pasos de pago (HTML enriquecido, lista numerada). Antes era un arreglo de textos. */
  paymentStepsText: string;
  futLabel: string;
  futUrl: string;
  reinstatementNote: string;
}

export const COSTOS_COPY: CostosContent = {
  heroTitle: 'Costos',
  legalRubric:
    'Relación de derechos, tasas, montos de pensiones u otros pagos que deben realizar los estudiantes por toda índole.',
  tarifarioLead:
    'Montos vigentes de admisión, matrícula, pensión y reincorporación. El voucher debe consignar nombres, apellidos y DNI del estudiante.',
  tarifarioUrl:
    'https://pcanadiense-my.sharepoint.com/:b:/g/personal/supervisor_pcanadiense_edu_pe/EdKV0g3T6CJIk7FgHKvbjFkBvViLDzc7Ews0xSeTYDSt1A?e=lIcKL2',
  cover: {
    src: 'assets/derechos%20y%20tasas.jpg',
    alt: 'Imagen del rubro Derechos y tasas en el Portal de Transparencia Institucional',
  },
  matriculaImage: {
    src: 'assets/img_matricula_2025.jpeg',
    alt: 'Atención de matrícula en el IESPP Peruano Canadiense',
  },
  matriculaLead:
    'Proceso de matrícula de Formación Inicial Docente publicado por el instituto. Los ciclos convocados en ese proceso son I, III, IV, VI, VII, VIII y X.',
  paymentStepsText: [
    '<ol>',
    '<li>Abonar en las cuentas institucionales. En el voucher deben figurar los nombres completos y el DNI del estudiante.</li>',
    '<li>Enviar el voucher desde el correo institucional. El destinatario vigente se confirma por WhatsApp o mesa de partes; el portal original no publicó un correo de pagos.</li>',
    '<li>Registrar la matrícula en el FUT con los datos y el número de boleta.</li>',
    '</ol>',
  ].join(''),
  futLabel: 'FUT — ficha de matrícula',
  futUrl: 'https://goo.su/58tk5',
  reinstatementNote:
    'Quienes se reincorporan presentan solicitud y boleta del derecho de trámite por mesa de partes.',
};
