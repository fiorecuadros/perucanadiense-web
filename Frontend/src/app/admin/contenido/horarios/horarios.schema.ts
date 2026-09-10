import { HORARIOS_DOCS } from '../../../core/constants/horarios.constant';
import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const HORARIOS_TABS = HORARIOS_DOCS.map((d) => ({ id: d.id, label: d.label }));

export const HORARIOS_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de la página', tipo: 'texto', seccion: 'atencion' },
  { key: 'clasesLead', label: 'Texto de clases presenciales', tipo: 'area', seccion: 'clases' },
  { key: 'workingNote', label: 'Nota para quienes trabajan', tipo: 'area', seccion: 'clases' },
  { key: 'clasesEmpty', label: 'Aviso de grilla no publicada', tipo: 'area', seccion: 'clases' },
];
