export const INTAKE_CONDITIONS = [
  'Estudiante',
  'Docente',
  'Administrativo',
  'Egresado',
  'Postulante',
  'Externo',
] as const;

export const INTAKE_DOC_TYPES = [
  'Solicitud',
  'FUT',
  'Recurso de reconsideración',
  'Apelación',
  'Constancia',
  'Certificado',
  'Otro',
] as const;

export type IntakeCondition = (typeof INTAKE_CONDITIONS)[number];
export type IntakeDocType = (typeof INTAKE_DOC_TYPES)[number];
export type IntakeStatus = 'pendiente' | 'recibido' | 'en_tramite' | 'finalizado';

export interface IntakePayload {
  nombres: string;
  dni: string;
  telefono: string;
  correo: string;
  condicion: IntakeCondition;
  tipoDoc: IntakeDocType;
  folios: number;
  asunto: string;
  mensaje: string;
  fileName?: string;
  linkDocumento?: string;
}

export interface IntakeRecord {
  trackingCode: string;
  submittedAt: string;
  status: IntakeStatus;
  payload: IntakePayload;
}

export interface IntakeSubmitResult {
  trackingCode: string;
  emailAdmin: string;
  emailIntake: string;
  futUrl: string;
}
