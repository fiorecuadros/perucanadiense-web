export interface PteRubro {
  id: string;
  titulo: string;
  descripcion: string;
  icon: string;
  ruta: string;
  estado: 'publicado' | 'vacio';
}

export interface TransparenciaContent {
  heroTitle: string;
  heroSubtitle: string;
  lead: string;
  rubros: PteRubro[];
}

export const PTE_RUBROS: PteRubro[] = [
  {
    id: 'reglamento',
    titulo: 'Reglamento interno',
    descripcion: 'Estatuto y normas de convivencia (rubro 1).',
    icon: 'fa-file-shield',
    ruta: '/procedimientos',
    estado: 'publicado',
  },
  {
    id: 'tasas',
    titulo: 'Derechos y tasas',
    descripcion: 'Admisión, matrícula, pensión y reincorporación (rubro 2).',
    icon: 'fa-coins',
    ruta: '/costos',
    estado: 'publicado',
  },
  {
    id: 'investigacion',
    titulo: 'Proyectos de investigación',
    descripcion: 'Tesis y producción académica publicada (rubro 3).',
    icon: 'fa-flask',
    ruta: '/repositorio',
    estado: 'publicado',
  },
  {
    id: 'personal',
    titulo: 'Personal docente',
    descripcion: 'Directorio de autoridades, administrativos y docentes (rubro 4).',
    icon: 'fa-chalkboard-user',
    ruta: '/nosotros',
    estado: 'publicado',
  },
  {
    id: 'estadisticas',
    titulo: 'Matriculados y egresados',
    descripcion: 'Cifras del periodo y reportes del PTI (rubro 5).',
    icon: 'fa-chart-column',
    ruta: '/estadisticas',
    estado: 'publicado',
  },
  {
    id: 'programas',
    titulo: 'Programas y horarios',
    descripcion: 'Oferta FID y técnica, más horarios de atención (rubro 6).',
    icon: 'fa-graduation-cap',
    ruta: '/programas',
    estado: 'publicado',
  },
  {
    id: 'tupa',
    titulo: 'TUPA',
    descripcion: 'Texto Único de Procedimientos Administrativos (rubro 7).',
    icon: 'fa-scroll',
    ruta: '/procedimientos',
    estado: 'publicado',
  },
  {
    id: 'becas',
    titulo: 'Becas y créditos',
    descripcion: 'Relación del año. El rubro 8 del PTI oficial está vacío.',
    icon: 'fa-award',
    ruta: '/becas',
    estado: 'vacio',
  },
  {
    id: 'inversiones',
    titulo: 'Inversiones y reinversiones',
    descripcion: 'Informe de infraestructura. El rubro 9 del PTI oficial está vacío.',
    icon: 'fa-building',
    ruta: '/inversiones',
    estado: 'vacio',
  },
  {
    id: 'licenciamiento',
    titulo: 'Periodo de licenciamiento',
    descripcion: 'Identidad legal y RVM-097-2022-MINEDU (rubro 10).',
    icon: 'fa-stamp',
    ruta: '/licenciamiento',
    estado: 'publicado',
  },
];

export const TRANSPARENCIA_COPY: TransparenciaContent = {
  heroTitle: 'Transparencia institucional',
  heroSubtitle:
    'Ley N° 30512 (Portal de Transparencia) y Ley N° 27806 (acceso a la información pública)',
  lead: 'Los diez rubros del Portal de Transparencia Institucional. Si un PDF no está archivado en este sitio, la página del rubro lo indica con “Sin documentos publicados”.',
  rubros: PTE_RUBROS,
};
