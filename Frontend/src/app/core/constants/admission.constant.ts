/**
 * Copy y materiales del proceso de admisión FID.
 * Tarifas, cuentas y vacantes viven en INSTITUTION / ACADEMIC_PROGRAMS.
 * Afiches: archivos reales en public/assets/.
 */

export type AdmissionDocKind = 'image' | 'panel';

export interface AdmissionDoc {
  id: string;
  label: string;
  kind: AdmissionDocKind;
  src?: string;
  alt?: string;
}

export const ADMISSION_DOCS: readonly AdmissionDoc[] = [
  {
    id: 'convocatoria',
    label: 'Convocatoria',
    kind: 'image',
    src: 'assets/Admision%202026-04-04.png',
    alt: 'Afiche del examen de admisión 2026 del IESPP Peruano Canadiense',
  },
  {
    id: 'horarios',
    label: 'Horarios de atención',
    kind: 'image',
    src: 'assets/horario_atencion_2026v2.png',
    alt: 'Horarios de atención al público del IESPP Peruano Canadiense',
  },
  { id: 'vacantes', label: 'Vacantes', kind: 'panel' },
  { id: 'evaluacion', label: 'Evaluación', kind: 'panel' },
  { id: 'requisitos', label: 'Requisitos', kind: 'panel' },
  { id: 'inscripcion', label: 'Inscripción', kind: 'panel' },
  { id: 'pagos', label: 'Costos y pagos', kind: 'panel' },
  { id: 'normas', label: 'Normas', kind: 'panel' },
];

export interface AdmissionScoreItem {
  label: string;
  score: number;
}

export interface AdmissionContent {
  year: number;
  heroTitle: string;
  presentation: string;
  modality: string;
  inscriptionSteps: string[];
  emailFields: string[];
  emailTemplate: string;
  requirements: string[];
  norms: string[];
  passingScore: number;
  writtenWeight: number;
  interviewWeight: number;
  writtenItems: AdmissionScoreItem[];
  interviewItems: AdmissionScoreItem[];
  /** Aviso bajo el afiche. No inventa fecha: se confirma por WhatsApp o correo. */
  convocatoriaNota: string;
}

export const ADMISSION_COPY: AdmissionContent = {
  year: 2026,
  heroTitle: 'Admisión 2026',
  presentation:
    'La carrera profesional de educación es una de las alternativas que hoy cobra protagonismo en el ámbito local y nacional. Para el Estado peruano el sector educación es una prioridad; estudiar educación constituye una oportunidad para construir el futuro.',
  modality: 'Presencial, con soporte sincrónico y asincrónico en Microsoft Teams.',
  inscriptionSteps: [
    'Pagar el derecho de examen de admisión en las cuentas institucionales.',
    'Enviar un correo a la mesa de partes de admisión aceptando las normas del proceso y solicitando la inscripción.',
  ],
  emailFields: [
    'Nombres y apellidos',
    'Carrera a la que postula',
    'Número de teléfono celular',
    'Declaración jurada de aceptación de las normas del proceso',
    'Fotografía y requisitos adjuntos',
  ],
  emailTemplate: [
    'Buen día, por medio de la presente yo: [Nombres y Apellidos] con DNI N° [Número] con domicilio en: [Dirección] y con número de celular o teléfono: [Número]. Solicito la inscripción al examen de admisión presencial en la especialidad de: [Especialidad].',
    'Para ello acepto contar con las condiciones técnicas necesarias para rendir dicho examen y también con los requisitos que se me solicitan para poder matricularme.',
    'Sin otro particular adjunto lo solicitado.',
  ].join('\n\n'),
  requirements: [
    'Partida de nacimiento original.',
    'Certificado original de estudios secundarios completos.',
    '04 fotografías tamaño carné a colores.',
    '02 copias del DNI.',
    '02 micas transparentes tamaño A4.',
    'Voucher de depósito bancario por derecho de examen de admisión.',
    'Declaración jurada de aceptación del reglamento del proceso.',
  ],
  norms: [
    'Registrarse para el proceso enviando un correo electrónico con los datos indicados en Inscripción.',
    'No se efectúan devoluciones del importe del examen de admisión una vez inscritos.',
    'Los requisitos se presentan de manera virtual y, posteriormente, en físico para la matrícula. De no completarlos, no será responsabilidad de la institución.',
  ],
  passingScore: 11,
  writtenWeight: 50,
  interviewWeight: 50,
  writtenItems: [
    { label: 'Comunicación en lengua materna', score: 20 },
    { label: 'Resolución de problemas matemáticos', score: 20 },
    { label: 'Convivencia y participación democrática', score: 10 },
  ],
  interviewItems: [
    { label: 'Pensamiento crítico y creativo', score: 20 },
    { label: 'Trabajo colaborativo', score: 20 },
    { label: 'Tecnologías de la información y comunicación', score: 10 },
  ],
  convocatoriaNota:
    'La fecha de la siguiente convocatoria se confirma por WhatsApp o correo.',
};

export function normalizarAdmision(raw: unknown): AdmissionContent {
  const semilla = structuredClone(ADMISSION_COPY);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return semilla;
  return { ...semilla, ...(raw as Partial<AdmissionContent>) };
}
