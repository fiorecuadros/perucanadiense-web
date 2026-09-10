import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const RECLAMACIONES_PAGINA_TABS = [
  { id: 'portada', label: 'Portada' },
  { id: 'pasos', label: 'Pasos' },
  { id: 'tipos', label: 'Tipos' },
] as const;

export const RECLAMACIONES_PAGINA_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de portada', tipo: 'texto', seccion: 'portada' },
  { key: 'heroSubtitle', label: 'Bajada legal', tipo: 'area', seccion: 'portada' },
  { key: 'lead', label: 'Texto de introducción', tipo: 'area', seccion: 'portada' },
  {
    key: 'pasos',
    label: 'Pasos del trámite',
    tipo: 'filas',
    seccion: 'pasos',
    columnas: [
      { key: 'paso', label: 'N.°', tipo: 'numero' },
      { key: 'titulo', label: 'Título', tipo: 'texto' },
      { key: 'descripcion', label: 'Descripción', tipo: 'texto' },
    ],
  },
  {
    key: 'tiposDocumento',
    label: 'Tipos de documento',
    tipo: 'lista',
    seccion: 'tipos',
  },
  {
    key: 'tiposReclamo',
    label: 'Tipos de reclamo',
    tipo: 'lista',
    seccion: 'tipos',
  },
];
