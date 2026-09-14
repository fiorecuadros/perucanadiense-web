/**
 * Estadísticas institucionales. Cifras de portada: INSTITUTION.metrics2025.
 * El desglose por año/programa está en el PDF del PTI (SharePoint), no en el repo.
 */

export type EstadisticasDocKind = 'cifras' | 'vacantes' | 'pti' | 'resultados' | 'consultas';

export interface EstadisticasDoc {
  id: EstadisticasDocKind;
  label: string;
}

export const ESTADISTICAS_DOCS: readonly EstadisticasDoc[] = [
  { id: 'cifras', label: 'Cifras del periodo' },
  { id: 'vacantes', label: 'Vacantes FID' },
  { id: 'pti', label: 'Matriculados y egresados' },
  { id: 'resultados', label: 'Resultados de admisión' },
  { id: 'consultas', label: 'Consultas' },
];

export interface EstadisticasContent {
  heroTitle: string;
  cifrasLead: string;
  ptiRubric: string;
  ptiUrl: string;
  ptiCover: { src: string; alt: string };
  resultadosLead: string;
  resultadosUrl: string;
}

export const ESTADISTICAS_COPY: EstadisticasContent = {
  heroTitle: 'Estadísticas',
  cifrasLead:
    'Cifras publicadas en el portal institucional para el periodo indicado. No sustituyen el reporte por programa del Portal de Transparencia.',
  ptiRubric: 'El número de ingresantes, matriculados y egresados por año y programa formativo.',
  ptiUrl:
    'https://pcanadiense-my.sharepoint.com/:b:/g/personal/supervisor_pcanadiense_edu_pe/EcVz9jCUAnhEocDnFDnqDdUBvVclw2Fgu15yuP4JCW3uNA?e=y9MNmn',
  ptiCover: {
    src: 'assets/matriculados-egresados.jpg',
    alt: 'Imagen del rubro Matriculados y egresados en el Portal de Transparencia Institucional',
  },
  resultadosLead: 'Resultados de admisión del periodo 2025-II publicados por el instituto.',
  resultadosUrl:
    'https://pcanadiense-my.sharepoint.com/:b:/g/personal/supervisor_pcanadiense_edu_pe/ERLuz5GigO5Aj_xmNdrLX_0B7M7v-3ZnwbIipFouj5aM2w?e=djfKj6',
};
