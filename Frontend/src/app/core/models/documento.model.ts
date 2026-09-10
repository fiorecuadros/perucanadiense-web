export type ModuloId =
  | 'becas'
  | 'costos'
  | 'estadisticas'
  | 'horarios'
  | 'inversiones'
  | 'licenciamiento'
  | 'admision'
  | 'inicio'
  | 'nosotros'
  | 'servicios'
  | 'transparencia'
  | 'reglamentos'
  | 'procedimientos'
  | 'psicopedagogico'
  | 'servicio-social'
  | 'soporte-medico'
  | 'reclamaciones'
  | 'privacidad'
  | 'repositorio-copy';

export interface DocumentoInstitucional {
  id: string;
  modulo: ModuloId;
  seccion: string;
  titulo: string;
  descripcion?: string;
  tipo: 'pdf' | 'enlace' | 'imagen';
  url: string;
  anio?: string;
  orden: number;
  estado: 'publicado' | 'borrador';
  actualizadoEn: string;
}

export interface ModuloMeta {
  id: ModuloId;
  titulo: string;
  path: string;
  adminPath: string;
  icon: string;
}

export const MODULO_META: readonly ModuloMeta[] = [
  { id: 'inicio', titulo: 'Inicio', path: '/inicio', adminPath: '/admin/inicio', icon: 'fa-house' },
  {
    id: 'nosotros',
    titulo: 'Nosotros',
    path: '/nosotros',
    adminPath: '/admin/nosotros',
    icon: 'fa-landmark',
  },
  {
    id: 'admision',
    titulo: 'Admisión',
    path: '/admision',
    adminPath: '/admin/admision',
    icon: 'fa-user-graduate',
  },
  {
    id: 'becas',
    titulo: 'Becas y créditos',
    path: '/becas',
    adminPath: '/admin/becas',
    icon: 'fa-award',
  },
  { id: 'costos', titulo: 'Costos', path: '/costos', adminPath: '/admin/costos', icon: 'fa-coins' },
  {
    id: 'estadisticas',
    titulo: 'Estadísticas',
    path: '/estadisticas',
    adminPath: '/admin/estadisticas',
    icon: 'fa-chart-column',
  },
  {
    id: 'horarios',
    titulo: 'Horarios',
    path: '/horarios',
    adminPath: '/admin/horarios',
    icon: 'fa-clock',
  },
  {
    id: 'inversiones',
    titulo: 'Inversiones',
    path: '/inversiones',
    adminPath: '/admin/inversiones',
    icon: 'fa-building',
  },
  {
    id: 'licenciamiento',
    titulo: 'Licenciamiento',
    path: '/licenciamiento',
    adminPath: '/admin/licenciamiento',
    icon: 'fa-stamp',
  },
  {
    id: 'servicios',
    titulo: 'Servicios',
    path: '/servicios',
    adminPath: '/admin/servicios',
    icon: 'fa-hands-holding-heart',
  },
  {
    id: 'transparencia',
    titulo: 'Transparencia',
    path: '/transparencia',
    adminPath: '/admin/transparencia',
    icon: 'fa-file-shield',
  },
  {
    id: 'reglamentos',
    titulo: 'Reglamentos',
    path: '/reglamentos',
    adminPath: '/admin/reglamentos',
    icon: 'fa-scale-balanced',
  },
  {
    id: 'procedimientos',
    titulo: 'Procedimientos',
    path: '/procedimientos',
    adminPath: '/admin/procedimientos',
    icon: 'fa-file-lines',
  },
  {
    id: 'psicopedagogico',
    titulo: 'Psicopedagógico',
    path: '/psicopedagogico',
    adminPath: '/admin/psicopedagogico',
    icon: 'fa-user-graduate',
  },
  {
    id: 'servicio-social',
    titulo: 'Servicio social',
    path: '/servicio-social',
    adminPath: '/admin/servicio-social',
    icon: 'fa-handshake',
  },
  {
    id: 'soporte-medico',
    titulo: 'Soporte médico',
    path: '/soporte-medico',
    adminPath: '/admin/soporte-medico',
    icon: 'fa-kit-medical',
  },
  {
    id: 'reclamaciones',
    titulo: 'Libro de reclamaciones',
    path: '/reclamaciones',
    adminPath: '/admin/pagina-reclamaciones',
    icon: 'fa-book',
  },
  {
    id: 'privacidad',
    titulo: 'Privacidad',
    path: '/privacidad',
    adminPath: '/admin/privacidad',
    icon: 'fa-user-shield',
  },
  {
    id: 'repositorio-copy',
    titulo: 'Repositorio (textos)',
    path: '/repositorio',
    adminPath: '/admin/repositorio-copy',
    icon: 'fa-book-open',
  },
];
