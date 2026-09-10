import { BECAS_DOCS } from '../../../core/constants/becas.constant';
import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const BECAS_TABS = BECAS_DOCS;

export const BECAS_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de la página', tipo: 'texto', seccion: 'relacion' },
  { key: 'legalRubric', label: 'Rúbrica legal', tipo: 'area', seccion: 'relacion' },
  { key: 'emptyTitle', label: 'Título del estado vacío', tipo: 'texto', seccion: 'relacion' },
  { key: 'emptyBody', label: 'Texto del estado vacío', tipo: 'area', seccion: 'relacion' },
  {
    key: 'cover.src',
    label: 'Imagen de portada',
    tipo: 'url',
    seccion: 'relacion',
    acepta: 'imagen',
  },
  {
    key: 'cover.alt',
    label: 'Texto alternativo de la portada',
    tipo: 'texto',
    seccion: 'relacion',
  },
  { key: 'tasasLead', label: 'Texto de derechos y tasas', tipo: 'area', seccion: 'tasas' },
];
