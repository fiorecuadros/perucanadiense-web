import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const TRANSPARENCIA_TABS = [
  { id: 'portada', label: 'Portada' },
  { id: 'rubros', label: 'Rubros del PTI' },
] as const;

export const TRANSPARENCIA_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de portada', tipo: 'texto', seccion: 'portada' },
  { key: 'heroSubtitle', label: 'Bajada legal', tipo: 'area', seccion: 'portada' },
  { key: 'lead', label: 'Texto de introducción', tipo: 'area', seccion: 'portada' },
  {
    key: 'rubros',
    label: 'Diez rubros del PTI',
    tipo: 'filas',
    seccion: 'rubros',
    columnas: [
      { key: 'id', label: 'Id', tipo: 'texto' },
      { key: 'titulo', label: 'Título', tipo: 'texto' },
      { key: 'descripcion', label: 'Descripción', tipo: 'texto' },
      { key: 'icon', label: 'Icono', tipo: 'texto' },
      { key: 'ruta', label: 'Ruta', tipo: 'texto' },
      {
        key: 'estado',
        label: 'Estado',
        tipo: 'opciones',
        opciones: [
          { value: 'publicado', label: 'Publicado' },
          { value: 'vacio', label: 'Sin documentos' },
        ],
      },
    ],
  },
];
