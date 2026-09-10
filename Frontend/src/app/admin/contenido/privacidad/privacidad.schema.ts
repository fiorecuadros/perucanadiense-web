import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const PRIVACIDAD_TABS = [
  { id: 'portada', label: 'Portada' },
  { id: 'secciones', label: 'Secciones' },
] as const;

export const PRIVACIDAD_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de portada', tipo: 'texto', seccion: 'portada' },
  { key: 'heroSubtitle', label: 'Bajada legal', tipo: 'area', seccion: 'portada' },
  { key: 'intro', label: 'Introducción', tipo: 'area', seccion: 'portada' },
  {
    key: 'sections',
    label: 'Secciones',
    tipo: 'filas',
    seccion: 'secciones',
    columnas: [
      { key: 'title', label: 'Título', tipo: 'texto' },
      { key: 'body', label: 'Texto', tipo: 'texto' },
    ],
  },
];
