import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const REPOSITORIO_COPY_TABS = [{ id: 'portada', label: 'Portada' }] as const;

export const REPOSITORIO_COPY_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de portada', tipo: 'texto', seccion: 'portada' },
  { key: 'heroSubtitle', label: 'Bajada', tipo: 'area', seccion: 'portada' },
  {
    key: 'emptyPdf',
    label: 'Aviso cuando no hay PDF',
    tipo: 'area',
    seccion: 'portada',
  },
];
