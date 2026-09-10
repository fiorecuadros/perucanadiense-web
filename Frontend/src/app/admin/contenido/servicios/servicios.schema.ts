import type { CampoSchema } from '../../shared/editor-contenido/schema';

/**
 * Pestañas del editor de Servicios.
 *
 * La pestaña «Portada» (título y bajada de la página) está oculta por ahora a
 * pedido del instituto. El esquema de esos campos se conserva abajo para poder
 * reactivarla: basta con volver a incluir `{ id: 'portada', label: 'Portada' }`.
 */
export const SERVICIOS_TABS = [{ id: 'hub', label: 'Servicios' }] as const;

export const SERVICIOS_TABS_COMPLETO = [
  { id: 'portada', label: 'Portada' },
  { id: 'hub', label: 'Servicios' },
] as const;

export const SERVICIOS_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de portada', tipo: 'texto', seccion: 'portada' },
  { key: 'heroSubtitle', label: 'Bajada', tipo: 'area', seccion: 'portada' },
  {
    key: 'hub',
    label: 'Servicios del hub',
    tipo: 'filas',
    seccion: 'hub',
    columnas: [
      { key: 'titulo', label: 'Título', tipo: 'texto' },
      { key: 'descripcion', label: 'Descripción', tipo: 'texto' },
      { key: 'icon', label: 'Icono Font Awesome', tipo: 'texto' },
      { key: 'ruta', label: 'Ruta', tipo: 'texto' },
    ],
  },
];
