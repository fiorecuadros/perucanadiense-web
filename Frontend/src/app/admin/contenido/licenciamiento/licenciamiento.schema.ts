import { LICENCIAMIENTO_DOCS } from '../../../core/constants/licenciamiento.constant';
import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const LICENCIAMIENTO_TABS = LICENCIAMIENTO_DOCS;

export const LICENCIAMIENTO_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de la página', tipo: 'texto', seccion: 'identidad' },
  { key: 'identityLead', label: 'Texto de identidad legal', tipo: 'area', seccion: 'identidad' },
  {
    key: 'rumboNote',
    label: 'Nota sobre «Rumbo al Licenciamiento»',
    tipo: 'area',
    seccion: 'identidad',
  },
  {
    key: 'recognitionNorm',
    label: 'Norma de reconocimiento DREL',
    tipo: 'texto',
    seccion: 'identidad',
  },
  { key: 'legalRubric', label: 'Rúbrica legal (periodo)', tipo: 'area', seccion: 'norma' },
  { key: 'emptyTitle', label: 'Título del aviso del PTI', tipo: 'texto', seccion: 'norma' },
  { key: 'emptyBody', label: 'Texto del aviso del PTI', tipo: 'area', seccion: 'norma' },
  { key: 'rvmLabel', label: 'Etiqueta del enlace RVM', tipo: 'texto', seccion: 'norma' },
  {
    key: 'rvmUrl',
    label: 'URL de la RVM (respaldo)',
    tipo: 'url',
    seccion: 'norma',
    acepta: 'pdf',
  },
  {
    key: 'cover.src',
    label: 'Imagen de portada',
    tipo: 'url',
    seccion: 'norma',
    acepta: 'imagen',
  },
  { key: 'cover.alt', label: 'Texto alternativo de la portada', tipo: 'texto', seccion: 'norma' },
  { key: 'carrerasLead', label: 'Texto de carreras FID', tipo: 'area', seccion: 'carreras' },
];
