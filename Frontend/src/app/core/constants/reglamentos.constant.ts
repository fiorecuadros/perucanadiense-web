export type ReglamentoEstado = 'enlace' | 'sin-publicar';

export interface ReglamentoCategoria {
  id: string;
  nombre: string;
}

export interface ReglamentoItem {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: 'reglamento' | 'directivas' | 'etica' | 'manuales';
  estado: ReglamentoEstado;
  ruta?: string;
}

export interface ReglamentosContent {
  heroTitle: string;
  heroSubtitle: string;
  emptyTitle: string;
  emptyBody: string;
  categorias: ReglamentoCategoria[];
  items: ReglamentoItem[];
}

export const REGLAMENTOS_CATEGORIAS: ReglamentoCategoria[] = [
  { id: 'todos', nombre: 'Todos' },
  { id: 'reglamento', nombre: 'Reglamento institucional' },
  { id: 'directivas', nombre: 'Directivas académicas' },
  { id: 'etica', nombre: 'Ética' },
  { id: 'manuales', nombre: 'Manuales' },
];

export const REGLAMENTOS_ITEMS: ReglamentoItem[] = [
  {
    id: 'interno',
    titulo: 'Reglamento interno e institucional',
    descripcion: 'Estatuto y normas de convivencia (rubro 1 del PTI). El PDF vive en SharePoint.',
    categoria: 'reglamento',
    estado: 'enlace',
    ruta: '/procedimientos',
  },
  {
    id: 'tupa',
    titulo: 'TUPA institucional',
    descripcion: 'Texto Único de Procedimientos Administrativos (rubro 7 del PTI).',
    categoria: 'reglamento',
    estado: 'enlace',
    ruta: '/procedimientos',
  },
  {
    id: 'tasas',
    titulo: 'Derechos y tasas',
    descripcion: 'Tarifario oficial de admisión, matrícula, pensión y reincorporación.',
    categoria: 'manuales',
    estado: 'enlace',
    ruta: '/costos',
  },
  {
    id: 'admision',
    titulo: 'Normas del proceso de admisión',
    descripcion: 'Requisitos, evaluación y pagos del proceso vigente.',
    categoria: 'directivas',
    estado: 'enlace',
    ruta: '/admision',
  },
  {
    id: 'etica-docente',
    titulo: 'Código de ética del docente',
    descripcion: 'El portal institucional no publicó este PDF en el sitio archivado.',
    categoria: 'etica',
    estado: 'sin-publicar',
  },
  {
    id: 'etica-estudiante',
    titulo: 'Código de ética del estudiante',
    descripcion: 'El portal institucional no publicó este PDF en el sitio archivado.',
    categoria: 'etica',
    estado: 'sin-publicar',
  },
  {
    id: 'mof',
    titulo: 'Manual de organización y funciones',
    descripcion: 'El portal institucional no publicó este PDF en el sitio archivado.',
    categoria: 'manuales',
    estado: 'sin-publicar',
  },
];

export const REGLAMENTOS_COPY: ReglamentosContent = {
  heroTitle: 'Reglamentos',
  heroSubtitle:
    'Normativa institucional. Solo se enlazan documentos o páginas que el instituto ha publicado.',
  emptyTitle: 'Sin documento publicado',
  emptyBody:
    'Este instrumento no tiene un PDF archivado en el portal. Cuando el instituto lo publique, aparecerá aquí o en Procedimientos.',
  categorias: REGLAMENTOS_CATEGORIAS,
  items: REGLAMENTOS_ITEMS,
};
