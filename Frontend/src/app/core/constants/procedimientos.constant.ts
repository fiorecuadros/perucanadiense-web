export type ProcedimientosDocKind =
  | 'tupa'
  | 'reglamento'
  | 'tasas'
  | 'matricula'
  | 'reincorporacion'
  | 'titulacion';

export interface ProcedimientosDoc {
  id: ProcedimientosDocKind | string;
  label: string;
}

export interface ProcedimientosContent {
  heroTitle: string;
  legalRubric: string;
  emptyTitle: string;
  emptyBody: string;
  tupaLead: string;
  tupaCover: { src: string; alt: string };
  reglamentoLead: string;
  reglamentoCover: { src: string; alt: string };
  tasasLead: string;
  matriculaLead: string;
  futLabel: string;
  futUrl: string;
  reinstatementLead: string;
  titulacionLead: string;
  tramites: ProcedimientosDoc[];
}

export const PROCEDIMIENTOS_DOCS: ProcedimientosDoc[] = [
  { id: 'tupa', label: 'TUPA' },
  { id: 'reglamento', label: 'Reglamento interno' },
  { id: 'tasas', label: 'Derechos y tasas' },
  { id: 'matricula', label: 'Matrícula' },
  { id: 'reincorporacion', label: 'Reincorporación' },
  { id: 'titulacion', label: 'Grados y títulos' },
];

export const PROCEDIMIENTOS_COPY: ProcedimientosContent = {
  heroTitle: 'Procedimientos',
  legalRubric:
    'Texto Único de Procedimientos Administrativos y trámites institucionales del IESPP Peruano Canadiense.',
  emptyTitle: 'Sin documento publicado',
  emptyBody:
    'Este procedimiento aún no tiene un PDF institucional en el portal. Cuando el instituto lo publique, aparecerá aquí.',
  tupaLead:
    'El TUPA institucional (rubro 7 del Portal de Transparencia, Ley N° 30512) describe los trámites administrativos, requisitos y plazos. El archivo vive en SharePoint y no está archivado en este sitio.',
  tupaCover: {
    src: 'images/pcanadiense/tupa.jpg',
    alt: 'Imagen del rubro TUPA en el Portal de Transparencia Institucional',
  },
  reglamentoLead:
    'El reglamento interno e institucional (rubro 1 del PTI) contiene el estatuto y las normas de convivencia. El PDF no está archivado en este repositorio.',
  reglamentoCover: {
    src: 'images/pcanadiense/reglamento.jpg',
    alt: 'Imagen del rubro Reglamento interno en el Portal de Transparencia Institucional',
  },
  tasasLead:
    'Las tasas vigentes de admisión, matrícula, pensión y reincorporación están publicadas en Costos. El tarifario del PTI se abre desde esa página.',
  matriculaLead:
    'El proceso de matrícula FID se registra en el FUT digital. Los ciclos atendidos en el último proceso publicado son I, III, IV, VI, VII, VIII y X.',
  futLabel: 'FUT — ficha de matrícula',
  futUrl: 'https://goo.su/58tk5',
  reinstatementLead:
    'Quienes se reincorporan presentan solicitud y boleta del derecho de trámite por mesa de partes o al correo institucional de trámites.',
  titulacionLead:
    'El instituto emite títulos profesionales pedagógicos a nombre de la Nación, inscritos ante la DREL. El registro publicado cubre emisiones 2021–2022.',
  tramites: PROCEDIMIENTOS_DOCS,
};
