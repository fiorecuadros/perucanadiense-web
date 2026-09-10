import type { CampoSchema } from '../../shared/editor-contenido/schema';

export const PROCEDIMIENTOS_TABS = [
  { id: 'portada', label: 'Portada' },
  { id: 'tramites', label: 'Trámites' },
] as const;

export const PROCEDIMIENTOS_SCHEMA: CampoSchema[] = [
  { key: 'heroTitle', label: 'Título de la página', tipo: 'texto', seccion: 'portada' },
  { key: 'legalRubric', label: 'Nota legal', tipo: 'area', seccion: 'portada' },
  {
    key: 'emptyTitle',
    label: 'Título del aviso "sin documentos"',
    tipo: 'texto',
    seccion: 'portada',
  },
  { key: 'emptyBody', label: 'Texto del aviso "sin documentos"', tipo: 'area', seccion: 'portada' },

  { key: 'tupaLead', label: 'Texto del TUPA', tipo: 'area', seccion: 'portada', grupo: 'TUPA' },
  {
    key: 'tupaCover.src',
    label: 'Imagen del TUPA',
    tipo: 'url',
    seccion: 'portada',
    acepta: 'imagen',
    grupo: 'TUPA',
  },
  {
    key: 'tupaCover.alt',
    label: 'Texto alternativo del TUPA',
    tipo: 'texto',
    seccion: 'portada',
    grupo: 'TUPA',
  },

  {
    key: 'reglamentoLead',
    label: 'Texto del reglamento',
    tipo: 'area',
    seccion: 'portada',
    grupo: 'Reglamento interno',
  },
  {
    key: 'reglamentoCover.src',
    label: 'Imagen del reglamento',
    tipo: 'url',
    seccion: 'portada',
    acepta: 'imagen',
    grupo: 'Reglamento interno',
  },
  {
    key: 'reglamentoCover.alt',
    label: 'Texto alternativo del reglamento',
    tipo: 'texto',
    seccion: 'portada',
    grupo: 'Reglamento interno',
  },

  {
    key: 'tasasLead',
    label: 'Texto de derechos y tasas',
    tipo: 'area',
    seccion: 'portada',
    grupo: 'Pagos y matrícula',
  },
  {
    key: 'matriculaLead',
    label: 'Texto de matrícula',
    tipo: 'area',
    seccion: 'portada',
    grupo: 'Pagos y matrícula',
  },
  {
    key: 'futLabel',
    label: 'Nombre del enlace FUT',
    tipo: 'texto',
    seccion: 'portada',
    grupo: 'Pagos y matrícula',
  },
  {
    key: 'futUrl',
    label: 'Enlace al formato FUT',
    tipo: 'url',
    seccion: 'portada',
    grupo: 'Pagos y matrícula',
  },

  {
    key: 'reinstatementLead',
    label: 'Texto de reincorporación',
    tipo: 'area',
    seccion: 'portada',
    grupo: 'Reincorporación y titulación',
  },
  {
    key: 'titulacionLead',
    label: 'Texto de titulación',
    tipo: 'area',
    seccion: 'portada',
    grupo: 'Reincorporación y titulación',
  },

  {
    key: 'tramites',
    label: 'Trámites del visor',
    tipo: 'filas',
    seccion: 'tramites',
    columnas: [
      { key: 'id', label: 'Id', tipo: 'texto' },
      { key: 'label', label: 'Etiqueta', tipo: 'texto' },
    ],
  },
];
