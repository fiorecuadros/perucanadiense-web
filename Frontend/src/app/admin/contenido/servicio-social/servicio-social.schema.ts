import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const SERVICIO_SOCIAL_TABS = [
  { id: 'portada', label: 'Portada' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'apoyo', label: 'Tipos de apoyo' },
] as const;

export const SERVICIO_SOCIAL_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de portada', tipo: 'texto', seccion: 'portada' },
  { key: 'heroSubtitle', label: 'Bajada', tipo: 'area', seccion: 'portada' },
  {
    key: 'servicios',
    label: 'Servicios',
    tipo: 'filas',
    seccion: 'servicios',
    columnas: [
      { key: 'titulo', label: 'Título', tipo: 'texto' },
      { key: 'descripcion', label: 'Descripción', tipo: 'texto' },
      { key: 'icon', label: 'Icono', tipo: 'texto' },
      { key: 'requisitos', label: 'Requisitos (uno por línea)', tipo: 'texto' },
    ],
  },
  {
    key: 'tiposApoyo',
    label: 'Tipos de apoyo del formulario',
    tipo: 'lista',
    seccion: 'apoyo',
  },
];
