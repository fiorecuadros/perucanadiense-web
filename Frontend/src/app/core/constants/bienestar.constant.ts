export interface BienestarServicio {
  titulo: string;
  descripcion: string;
  icon: string;
  requisitos?: string;
}

export interface EmergenciaItem {
  titulo: string;
  descripcion: string;
  telefono: string;
  icon: string;
}

export interface PsicopedagogicoContent {
  heroTitle: string;
  heroSubtitle: string;
  servicios: BienestarServicio[];
}

export interface ServicioSocialContent {
  heroTitle: string;
  heroSubtitle: string;
  servicios: BienestarServicio[];
  tiposApoyo: string[];
}

export interface SoporteMedicoContent {
  heroTitle: string;
  heroSubtitle: string;
  campanasLead: string;
  servicios: BienestarServicio[];
  emergencias: EmergenciaItem[];
}

export const PSICOPEDAGOGICO_SERVICIOS: BienestarServicio[] = [
  {
    titulo: 'Orientación psicopedagógica',
    descripcion: 'Acompañamiento en dificultades de aprendizaje y estrategias de estudio.',
    icon: 'fa-compass',
  },
  {
    titulo: 'Salud mental',
    descripcion: 'Apoyo emocional y manejo de estrés o ansiedad académica.',
    icon: 'fa-heart-pulse',
  },
  {
    titulo: 'Acompañamiento académico',
    descripcion: 'Seguimiento del rendimiento y planes de mejora.',
    icon: 'fa-book',
  },
  {
    titulo: 'Talleres de habilidades',
    descripcion: 'Técnicas de estudio y habilidades de convivencia.',
    icon: 'fa-chalkboard-user',
  },
];

export const PSICOPEDAGOGICO_COPY: PsicopedagogicoContent = {
  heroTitle: 'Servicio psicopedagógico',
  heroSubtitle: 'Orientación, acompañamiento y apoyo para el bienestar académico y emocional',
  servicios: PSICOPEDAGOGICO_SERVICIOS,
};

export const SERVICIO_SOCIAL_SERVICIOS: BienestarServicio[] = [
  {
    titulo: 'Asistencia social',
    descripcion: 'Orientación en situaciones de vulnerabilidad socioeconómica.',
    icon: 'fa-handshake',
    requisitos:
      'Ficha de inscripción actualizada\nDNI del estudiante\nDocumentos de sustento que indique el área',
  },
  {
    titulo: 'Programas de apoyo',
    descripcion:
      'Las becas y créditos del año se publican en el Portal de Transparencia cuando el instituto las registra.',
    icon: 'fa-award',
    requisitos: 'Solicitud formal\nEvaluación socioeconómica',
  },
  {
    titulo: 'Categorización socioeconómica',
    descripcion: 'Evaluación para determinar el nivel de apoyo, según la normativa vigente.',
    icon: 'fa-clipboard-list',
    requisitos: 'Ficha de categorización\nDocumentos de ingresos familiares',
  },
  {
    titulo: 'Derivaciones',
    descripcion: 'Coordinación con instituciones externas cuando el caso lo requiere.',
    icon: 'fa-arrow-up-right-from-square',
    requisitos: 'Evaluación previa\nConsentimiento informado',
  },
];

export const TIPOS_APOYO_SOCIAL = [
  'Apoyo económico (beca)',
  'Apoyo con alimentación',
  'Apoyo con transporte',
  'Apoyo con materiales de estudio',
  'Apoyo psicosocial',
  'Otro',
];

export const SERVICIO_SOCIAL_COPY: ServicioSocialContent = {
  heroTitle: 'Servicio social',
  heroSubtitle: 'Asistencia socioeconómica y orientación para estudiantes',
  servicios: SERVICIO_SOCIAL_SERVICIOS,
  tiposApoyo: TIPOS_APOYO_SOCIAL,
};

export const SOPORTE_MEDICO_SERVICIOS: BienestarServicio[] = [
  {
    titulo: 'Primeros auxilios',
    descripcion: 'Atención inmediata de emergencias y accidentes en el campus.',
    icon: 'fa-kit-medical',
  },
  {
    titulo: 'Campañas de salud',
    descripcion: 'Vacunación, chequeos y promoción de la salud, cuando hay convocatoria publicada.',
    icon: 'fa-syringe',
  },
  {
    titulo: 'Orientación en salud',
    descripcion: 'Consejería sobre hábitos saludables y derivación a centros especializados.',
    icon: 'fa-stethoscope',
  },
];

export const EMERGENCIAS: EmergenciaItem[] = [
  {
    titulo: 'Instituto',
    descripcion: 'Central institucional para reportar una emergencia en el campus.',
    telefono: '',
    icon: 'fa-phone',
  },
  {
    titulo: 'SAMU',
    descripcion: 'Atención médica de urgencia.',
    telefono: '106',
    icon: 'fa-truck-medical',
  },
  {
    titulo: 'Policía Nacional',
    descripcion: 'Situaciones que requieran intervención policial.',
    telefono: '105',
    icon: 'fa-shield-halved',
  },
  {
    titulo: 'Bomberos',
    descripcion: 'Emergencias relacionadas con incendios.',
    telefono: '116',
    icon: 'fa-fire-extinguisher',
  },
];

export const SOPORTE_MEDICO_COPY: SoporteMedicoContent = {
  heroTitle: 'Soporte médico',
  heroSubtitle: 'Primeros auxilios y orientación en salud para la comunidad educativa',
  campanasLead:
    'Las campañas preventivas se anuncian por los canales institucionales cuando se programan. Aquí no se publican fechas que el instituto no haya fijado.',
  servicios: SOPORTE_MEDICO_SERVICIOS,
  emergencias: EMERGENCIAS,
};

export const CICLOS_ACADEMICOS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
] as const;
