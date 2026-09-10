export interface ServicioHubItem {
  titulo: string;
  descripcion: string;
  icon: string;
  ruta: string;
  externo?: boolean;
  proximamente?: boolean;
}

export interface ServiciosContent {
  heroTitle: string;
  heroSubtitle: string;
  hub: ServicioHubItem[];
}

export const SERVICIOS_HUB: ServicioHubItem[] = [
  {
    titulo: 'Servicio psicopedagógico',
    descripcion:
      'Orientación y acompañamiento en dificultades de aprendizaje, salud mental y desarrollo académico.',
    icon: 'fa-user-graduate',
    ruta: '/psicopedagogico',
  },
  {
    titulo: 'Servicio social',
    descripcion:
      'Apoyo socioeconómico y programas de asistencia para estudiantes. Las becas del año se publican en el rubro 8 del PTI.',
    icon: 'fa-handshake',
    ruta: '/servicio-social',
  },
  {
    titulo: 'Soporte médico',
    descripcion: 'Primeros auxilios, orientación en salud y contactos de emergencia.',
    icon: 'fa-kit-medical',
    ruta: '/soporte-medico',
  },
  {
    titulo: 'Repositorio institucional',
    descripcion: 'Tesis y proyectos de investigación publicados por el instituto.',
    icon: 'fa-book-open',
    ruta: '/repositorio',
  },
  {
    titulo: 'Mesa de partes',
    descripcion: 'Recepción de documentos, solicitudes y trámites administrativos.',
    icon: 'fa-inbox',
    ruta: '/mesa-de-partes',
  },
  {
    titulo: 'Procedimientos y TUPA',
    descripcion: 'Trámites institucionales, reglamento interno, matrícula y titulación.',
    icon: 'fa-file-lines',
    ruta: '/procedimientos',
  },
  {
    titulo: 'Libro de reclamaciones',
    descripcion: 'Hoja de reclamación virtual conforme a la Ley N° 29571.',
    icon: 'fa-scale-balanced',
    ruta: '/reclamaciones',
  },
  {
    titulo: 'Transparencia',
    descripcion: 'Portal de Transparencia Institucional (Ley N° 30512) y acceso a la información.',
    icon: 'fa-landmark',
    ruta: '/transparencia',
  },
];

export const SERVICIOS_COPY: ServiciosContent = {
  heroTitle: 'Servicios',
  heroSubtitle: 'Atención al estudiante, bienestar y entorno virtual Microsoft 365',
  hub: SERVICIOS_HUB,
};
