import { ADMISSION_DOCS } from '../../../core/constants/admission.constant';
import type { CampoSchema } from '../../shared/editor-contenido/schema';
import { FILAS_PUNTAJE } from '../../shared/editor-contenido/schema';

export const ADMISION_TABS = ADMISSION_DOCS.map((d) => ({ id: d.id, label: d.label }));

export const ADMISION_SCHEMA: CampoSchema[] = [
  {
    key: 'heroTitle',
    label: 'Título de la página',
    tipo: 'texto',
    seccion: 'convocatoria',
  },
  { key: 'year', label: 'Año de la convocatoria', tipo: 'numero', seccion: 'convocatoria' },
  {
    key: 'presentation',
    label: 'Texto de portada',
    tipo: 'area',
    seccion: 'convocatoria',
    hint: 'Aparece junto al afiche en la primera pantalla de /admision.',
  },
  {
    key: 'convocatoriaNota',
    label: 'Aviso bajo el afiche',
    tipo: 'area',
    seccion: 'convocatoria',
    hint: 'No ponga una fecha si aún no está confirmada. El afiche se carga en Documentos de esta sección.',
  },
  { key: 'modality', label: 'Modalidad', tipo: 'area', seccion: 'vacantes' },
  {
    key: 'writtenWeight',
    label: 'Peso de la prueba escrita (%)',
    tipo: 'numero',
    seccion: 'evaluacion',
  },
  {
    key: 'interviewWeight',
    label: 'Peso de la entrevista (%)',
    tipo: 'numero',
    seccion: 'evaluacion',
  },
  { key: 'passingScore', label: 'Nota mínima', tipo: 'numero', seccion: 'evaluacion' },
  {
    key: 'writtenItems',
    label: 'Criterios de la prueba escrita',
    tipo: 'filas',
    seccion: 'evaluacion',
    columnas: FILAS_PUNTAJE,
  },
  {
    key: 'interviewItems',
    label: 'Criterios de la entrevista',
    tipo: 'filas',
    seccion: 'evaluacion',
    columnas: FILAS_PUNTAJE,
  },
  { key: 'requirements', label: 'Requisitos', tipo: 'lista', seccion: 'requisitos' },
  { key: 'inscriptionSteps', label: 'Pasos de inscripción', tipo: 'lista', seccion: 'inscripcion' },
  { key: 'emailFields', label: 'Datos del correo', tipo: 'lista', seccion: 'inscripcion' },
  { key: 'emailTemplate', label: 'Modelo de mensaje', tipo: 'area', seccion: 'inscripcion' },
  { key: 'norms', label: 'Normas del proceso', tipo: 'lista', seccion: 'normas' },
];
