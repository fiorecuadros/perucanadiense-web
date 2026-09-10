import { INVERSIONES_DOCS } from '../../../core/constants/inversiones.constant';
import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const INVERSIONES_TABS = INVERSIONES_DOCS;

export const INVERSIONES_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de la página', tipo: 'texto', seccion: 'informe' },
  { key: 'legalRubric', label: 'Rúbrica legal', tipo: 'area', seccion: 'informe' },
  { key: 'emptyTitle', label: 'Título del estado vacío', tipo: 'texto', seccion: 'informe' },
  { key: 'emptyBody', label: 'Texto del estado vacío', tipo: 'area', seccion: 'informe' },
  {
    key: 'cover.src',
    label: 'Imagen de portada',
    tipo: 'url',
    seccion: 'informe',
    acepta: 'imagen',
  },
  { key: 'cover.alt', label: 'Texto alternativo de la portada', tipo: 'texto', seccion: 'informe' },
  { key: 'campusLead', label: 'Texto del campus', tipo: 'area', seccion: 'campus' },
  {
    key: 'facilitiesText',
    label: 'Infraestructura del campus',
    tipo: 'area',
    seccion: 'campus',
    hint: 'Use la lista con viñetas: un espacio por línea.',
  },
];
