import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const REGLAMENTOS_TABS = [
  { id: 'portada', label: 'Portada' },
  { id: 'categorias', label: 'Categorías' },
  { id: 'documentos', label: 'Documentos' },
] as const;

export const REGLAMENTOS_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de portada', tipo: 'texto', seccion: 'portada' },
  { key: 'heroSubtitle', label: 'Bajada', tipo: 'area', seccion: 'portada' },
  { key: 'emptyTitle', label: 'Título del aviso vacío', tipo: 'texto', seccion: 'portada' },
  { key: 'emptyBody', label: 'Texto del aviso vacío', tipo: 'area', seccion: 'portada' },
  {
    key: 'categorias',
    label: 'Categorías del filtro',
    tipo: 'filas',
    seccion: 'categorias',
    columnas: [
      { key: 'id', label: 'Id', tipo: 'texto' },
      { key: 'nombre', label: 'Nombre', tipo: 'texto' },
    ],
  },
  {
    key: 'items',
    label: 'Documentos',
    tipo: 'filas',
    seccion: 'documentos',
    columnas: [
      { key: 'id', label: 'Id', tipo: 'texto' },
      { key: 'titulo', label: 'Título', tipo: 'texto' },
      { key: 'descripcion', label: 'Descripción', tipo: 'texto' },
      {
        key: 'categoria',
        label: 'Categoría',
        tipo: 'opciones',
        opciones: [
          { value: 'reglamento', label: 'Reglamento institucional' },
          { value: 'directivas', label: 'Directivas académicas' },
          { value: 'etica', label: 'Ética' },
          { value: 'manuales', label: 'Manuales' },
        ],
      },
      {
        key: 'estado',
        label: 'Estado',
        tipo: 'opciones',
        opciones: [
          { value: 'enlace', label: 'Enlace publicado' },
          { value: 'sin-publicar', label: 'Sin publicar' },
        ],
      },
      { key: 'ruta', label: 'Ruta', tipo: 'texto' },
    ],
  },
];
