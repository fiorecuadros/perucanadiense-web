import { ESTADISTICAS_DOCS } from '../../../core/constants/estadisticas.constant';
import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const ESTADISTICAS_TABS = ESTADISTICAS_DOCS;

export const ESTADISTICAS_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de la página', tipo: 'texto', seccion: 'cifras' },
  { key: 'cifrasLead', label: 'Texto de cifras del periodo', tipo: 'area', seccion: 'cifras' },
  { key: 'ptiRubric', label: 'Rúbrica de matriculados y egresados', tipo: 'area', seccion: 'pti' },
  { key: 'ptiUrl', label: 'URL del informe del PTI (respaldo)', tipo: 'url', seccion: 'pti' },
  {
    key: 'ptiCover.src',
    label: 'Imagen del informe',
    tipo: 'url',
    seccion: 'pti',
    acepta: 'imagen',
  },
  { key: 'ptiCover.alt', label: 'Texto alternativo de la imagen', tipo: 'texto', seccion: 'pti' },
  {
    key: 'resultadosLead',
    label: 'Texto de resultados de admisión',
    tipo: 'area',
    seccion: 'resultados',
  },
  {
    key: 'resultadosUrl',
    label: 'URL de resultados (respaldo)',
    tipo: 'url',
    seccion: 'resultados',
  },
];
