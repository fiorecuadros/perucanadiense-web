import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const SOPORTE_MEDICO_TABS = [
  { id: 'portada', label: 'Portada' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'emergencias', label: 'Emergencias' },
] as const;

export const SOPORTE_MEDICO_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de portada', tipo: 'texto', seccion: 'portada' },
  { key: 'heroSubtitle', label: 'Bajada', tipo: 'area', seccion: 'portada' },
  { key: 'campanasLead', label: 'Nota de campañas', tipo: 'area', seccion: 'portada' },
  {
    key: 'servicios',
    label: 'Servicios',
    tipo: 'filas',
    seccion: 'servicios',
    columnas: [
      { key: 'titulo', label: 'Título', tipo: 'texto' },
      { key: 'descripcion', label: 'Descripción', tipo: 'texto' },
      { key: 'icon', label: 'Icono', tipo: 'texto' },
    ],
  },
  {
    key: 'emergencias',
    label: 'Contactos de emergencia',
    tipo: 'filas',
    seccion: 'emergencias',
    hint: 'Si el teléfono queda vacío, se usa la central institucional.',
    columnas: [
      { key: 'titulo', label: 'Nombre', tipo: 'texto' },
      { key: 'descripcion', label: 'Descripción', tipo: 'texto' },
      { key: 'telefono', label: 'Teléfono', tipo: 'texto' },
      { key: 'icon', label: 'Icono', tipo: 'texto' },
    ],
  },
];
