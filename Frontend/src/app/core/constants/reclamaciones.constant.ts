export interface ReclamacionPaso {
  paso: number;
  titulo: string;
  descripcion: string;
}

export interface ReclamacionesContent {
  heroTitle: string;
  heroSubtitle: string;
  lead: string;
  pasos: ReclamacionPaso[];
  tiposDocumento: string[];
  tiposReclamo: string[];
}

export const RECLAMACIONES_PASOS: ReclamacionPaso[] = [
  {
    paso: 1,
    titulo: 'Registro',
    descripcion: 'Complete el formulario con sus datos y el detalle del reclamo o queja.',
  },
  {
    paso: 2,
    titulo: 'Recepción',
    descripcion: 'Recibirá un código para el seguimiento de su solicitud.',
  },
  {
    paso: 3,
    titulo: 'Evaluación',
    descripcion: 'El área correspondiente evalúa el caso en el plazo legal.',
  },
  {
    paso: 4,
    titulo: 'Respuesta',
    descripcion: 'La institución responde por el medio de contacto que usted indicó.',
  },
];

export const TIPOS_DOCUMENTO_RECLAMO = ['DNI', 'Carnet de extranjería', 'Pasaporte'];
export const TIPOS_RECLAMO = ['Reclamo', 'Queja'];

export const RECLAMACIONES_COPY: ReclamacionesContent = {
  heroTitle: 'Libro de reclamaciones',
  heroSubtitle: 'Ley N° 29571 — Código de Protección y Defensa del Consumidor',
  lead: 'El Libro de Reclamaciones es el mecanismo de atención al consumidor. Su uso es gratuito. El plazo máximo de respuesta es de 30 días calendario.',
  pasos: RECLAMACIONES_PASOS,
  tiposDocumento: TIPOS_DOCUMENTO_RECLAMO,
  tiposReclamo: TIPOS_RECLAMO,
};
