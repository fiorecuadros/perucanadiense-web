export interface TesisItem {
  id: string;
  titulo: string;
  autores: readonly string[];
  programa: string;
  anio: string;
  tipo: 'Tesis';
  nivel: string;
  resumen: string;
  /** Presente solo cuando el PDF está archivado en el portal (lo devuelve el API). */
  pdfUrl?: string;
}

export interface RepositorioCopy {
  heroTitle: string;
  heroSubtitle: string;
  emptyPdf: string;
}

export const REPOSITORIO_COPY: RepositorioCopy = {
  heroTitle: 'Repositorio institucional',
  heroSubtitle: 'Tesis y proyectos de investigación publicados por el IESPP Peruano Canadiense',
  emptyPdf:
    'El archivo PDF de esta tesis no está archivado en este portal. Consulte mesa de partes o el área de investigación.',
};

/** Tesis registradas en el portal institucional (investigación.html). Sin códigos RENATI inventados. */
export const REPOSITORIO_ITEMS: readonly TesisItem[] = [
  {
    id: 'inteligencia-emocional-personal-social-2021',
    titulo:
      'La inteligencia emocional y su relación con el desarrollo de las competencias del Área de Personal Social de las niñas y niños de 05 años de la Institución Educativa del Nivel Inicial N° 14444 Comenderos Bajo, Huancabamba - Piura, 2021',
    autores: ['Lidia Noemí Meza Ojeda', 'Perla Rosalín Ojeda Domínguez'],
    programa: 'Educación Inicial',
    anio: '2021',
    tipo: 'Tesis',
    nivel: 'Educación Inicial',
    resumen:
      'Estudio sobre la relación entre la inteligencia emocional y las competencias del área de Personal Social en niñas y niños de cinco años.',
  },
  {
    id: 'estrategias-ludicas-geometria-2021',
    titulo:
      'Estrategias lúdicas para fortalecer el aprendizaje de la geometría durante las clases virtuales, en los estudiantes de primer grado “B” del Colegio San Ignacio de Loyola de Piura, 2021',
    autores: ['Sandy Janeth Saavedra Valdiviezo'],
    programa: 'Educación Primaria',
    anio: '2021',
    tipo: 'Tesis',
    nivel: 'Educación Inicial / Primaria',
    resumen:
      'Propuesta de estrategias lúdicas para el aprendizaje de la geometría en clases virtuales de primer grado.',
  },
  {
    id: 'juego-de-roles-habilidades-socioafectivas-2021',
    titulo:
      'El juego de roles como estrategia para desarrollar habilidades socioafectivas en niños de 4 años de las Instituciones Educativas N° 019 Sagrado Corazón de Jesús - Piura y la I.E. N° 15117 Caserío Potrerillo - Las Lomas - Piura, 2021',
    autores: ['Magali Rosalina Espinoza Pasache', 'Diana Gisela Peña Gaona'],
    programa: 'Educación Inicial',
    anio: '2021',
    tipo: 'Tesis',
    nivel: 'Educación Inicial',
    resumen:
      'Investigación sobre el juego de roles como estrategia para desarrollar habilidades socioafectivas en niños de cuatro años.',
  },
  {
    id: 'juegos-motores-motricidad-gruesa-2022',
    titulo:
      'Juegos motores como estrategia didáctica para mejorar la motricidad gruesa en los niños y niñas de 5 años de la I.E.I. Kínder Chiquitines de Chiclayo - 2022',
    autores: ['Investigación sustentada en junio de 2023'],
    programa: 'Educación Inicial',
    anio: '2022',
    tipo: 'Tesis',
    nivel: 'Educación Inicial',
    resumen:
      'Estrategia didáctica basada en juegos motores para mejorar la motricidad gruesa en niños de cinco años. Sustentada en junio de 2023.',
  },
];
