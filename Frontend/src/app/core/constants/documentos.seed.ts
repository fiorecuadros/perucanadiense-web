import type { DocumentoInstitucional } from '../models/documento.model';

const AHORA = '2026-01-15T00:00:00.000Z';

function doc(
  partial: Omit<DocumentoInstitucional, 'estado' | 'actualizadoEn'> & {
    estado?: DocumentoInstitucional['estado'];
  },
): DocumentoInstitucional {
  return {
    estado: 'publicado',
    actualizadoEn: AHORA,
    ...partial,
  };
}

/**
 * URLs sueltas del copy (tarifario, PTI, resultados, RVM, FUT, pósters).
 * Rubros 8 (becas) y 9 (inversiones) arrancan sin documentos.
 */
export const DOCUMENTOS_SEED: DocumentoInstitucional[] = [
  doc({
    id: 'seed-costos-tarifario',
    modulo: 'costos',
    seccion: 'tarifario',
    titulo: 'Tarifario del Portal de Transparencia',
    descripcion: 'Relación de derechos, tasas y pensiones publicada en el PTI.',
    tipo: 'enlace',
    url: 'https://pcanadiense-my.sharepoint.com/:b:/g/personal/supervisor_pcanadiense_edu_pe/EdKV0g3T6CJIk7FgHKvbjFkBvViLDzc7Ews0xSeTYDSt1A?e=lIcKL2',
    orden: 1,
  }),
  doc({
    id: 'seed-costos-fut',
    modulo: 'costos',
    seccion: 'matricula',
    titulo: 'FUT — ficha de matrícula',
    tipo: 'enlace',
    url: 'https://goo.su/58tk5',
    orden: 1,
  }),
  doc({
    id: 'seed-estadisticas-pti',
    modulo: 'estadisticas',
    seccion: 'pti',
    titulo: 'Matriculados y egresados — informe del PTI',
    descripcion: 'Desglose por año y programa formativo.',
    tipo: 'enlace',
    url: 'https://pcanadiense-my.sharepoint.com/:b:/g/personal/supervisor_pcanadiense_edu_pe/EcVz9jCUAnhEocDnFDnqDdUBvVclw2Fgu15yuP4JCW3uNA?e=y9MNmn',
    orden: 1,
  }),
  doc({
    id: 'seed-estadisticas-resultados',
    modulo: 'estadisticas',
    seccion: 'resultados',
    titulo: 'Resultados de admisión 2025-II',
    tipo: 'enlace',
    url: 'https://pcanadiense-my.sharepoint.com/:b:/g/personal/supervisor_pcanadiense_edu_pe/ERLuz5GigO5Aj_xmNdrLX_0B7M7v-3ZnwbIipFouj5aM2w?e=djfKj6',
    anio: '2025',
    orden: 1,
  }),
  doc({
    id: 'seed-licenciamiento-rvm',
    modulo: 'licenciamiento',
    seccion: 'norma',
    titulo: 'RVM-097-2022-MINEDU',
    descripcion: 'Resolución viceministerial publicada en el organigrama institucional.',
    tipo: 'pdf',
    url: '/docs/RVM-097-2022-MINEDU.pdf',
    anio: '2022',
    orden: 1,
  }),
  doc({
    id: 'seed-horarios-atencion',
    modulo: 'horarios',
    seccion: 'atencion',
    titulo: 'Afiche de horarios de atención al público',
    tipo: 'imagen',
    url: 'assets/horario_atencion_2026v2.png',
    anio: '2026',
    orden: 1,
  }),
  doc({
    id: 'seed-admision-convocatoria',
    modulo: 'admision',
    seccion: 'convocatoria',
    titulo: 'Afiche del examen de admisión 2026',
    tipo: 'imagen',
    url: 'assets/Admision%202026-04-04.png',
    anio: '2026',
    orden: 1,
  }),
  doc({
    id: 'seed-admision-horarios',
    modulo: 'admision',
    seccion: 'horarios',
    titulo: 'Horarios de atención al público',
    tipo: 'imagen',
    url: 'assets/horario_atencion_2026v2.png',
    anio: '2026',
    orden: 1,
  }),
];
