import type { NewsItem } from '../models/news.model';

export const NEWS_ITEMS: readonly NewsItem[] = [
  {
    id: 'examen-admision-2025-ii-fase-2',
    title: 'Examen de admisión 2025-II — segunda fase',
    category: 'evento',
    categoryLabel: 'Admisión',
    excerpt:
      'La comunidad institucional acompañó la segunda fase del proceso de admisión 2025-II, con entrevista situacional para las carreras FID.',
    paragraphs: [
      'El IESPP Peruano Canadiense desarrolló la segunda fase del examen de admisión 2025-II, correspondiente a la entrevista de evaluación situacional.',
      'La evaluación pondera pensamiento crítico y creativo, trabajo colaborativo y uso de TIC. La nota mínima aprobatoria es 11, en igualdad de peso con la prueba escrita.',
      'Las vacantes oficiales convocadas son 180: 90 en Educación Inicial, 30 en Primaria, 30 en Matemática y 30 en Ciudadanía y Ciencias Sociales.',
    ],
    image: 'images/pcanadiense/examen_admision_2025v2.jpg',
    imageAlt: 'Examen de admisión 2025-II del IESPP Peruano Canadiense',
    createdAt: '2025-08-02',
    featured: true,
  },
  {
    id: 'dia-de-la-peruanidad-2025',
    title: 'Día de la peruanidad 2025',
    category: 'evento',
    categoryLabel: 'Actividad',
    excerpt:
      'Estudiantes y docentes celebraron el Día de la peruanidad con actos cívicos y expresiones culturales de la región Lambayeque.',
    paragraphs: [
      'La comunidad educativa conmemoró el Día de la peruanidad con una jornada cívica y cultural en la sede de Chiclayo.',
      'La actividad refuerza la identidad regional y los valores institucionales de libertad, justicia, equidad, honestidad, solidaridad y responsabilidad.',
    ],
    image: 'images/pcanadiense/dia-bandera-01.jpg',
    imageAlt: 'Celebración del Día de la peruanidad en el IESPP Peruano Canadiense',
    createdAt: '2025-07-28',
  },
  {
    id: 'dia-del-maestro-2025',
    title: 'Día del maestro 2025',
    category: 'evento',
    categoryLabel: 'Actividad',
    excerpt:
      'El instituto rindió homenaje a la plana docente en el Día del Maestro, en reconocimiento a su labor formativa.',
    paragraphs: [
      'En el Día del Maestro, el IESPP Peruano Canadiense reconoció a las y los docentes que forman a los futuros maestros de Lambayeque.',
      'La jornada reunió a autoridades, docentes y estudiantes en un acto institucional de agradecimiento y afirmación de la vocación pedagógica.',
    ],
    image: 'images/pcanadiense/docentes.jpg',
    imageAlt: 'Homenaje por el Día del Maestro en el IESPP Peruano Canadiense',
    createdAt: '2025-07-06',
  },
  {
    id: 'dia-del-padre-2025',
    title: 'Día del padre 2025',
    category: 'evento',
    categoryLabel: 'Actividad',
    excerpt:
      'La comunidad educativa celebró el Día del Padre con una actividad institucional dirigida a familias y estudiantes.',
    paragraphs: [
      'El instituto organizó una actividad por el Día del Padre, abierta a la comunidad educativa de las carreras de Formación Inicial Docente.',
      'El encuentro se inscribe en las actividades de bienestar y convivencia institucional.',
    ],
    image: 'images/pcanadiense/invitacion.jpg',
    imageAlt: 'Actividad por el Día del Padre en el IESPP Peruano Canadiense',
    createdAt: '2025-06-18',
  },
  {
    id: 'examen-admision-2025-ii-fase-1',
    title: 'Examen de admisión 2025-II — primera fase',
    category: 'evento',
    categoryLabel: 'Admisión',
    excerpt:
      'Se rindió la prueba escrita del proceso de admisión 2025-II, con 50 preguntas de comunicación, matemática y convivencia democrática.',
    paragraphs: [
      'La primera fase del proceso de admisión 2025-II consistió en la prueba escrita, que representa el 50 % de la nota final.',
      'El examen incluye 20 preguntas de comunicación en lengua materna, 20 de resolución de problemas matemáticos y 10 de convivencia y participación democrática.',
      'Quienes obtienen nota mínima 11 clasifican a la entrevista situacional.',
    ],
    image: 'images/pcanadiense/proceso_admision_2025_01.jpg',
    imageAlt: 'Primera fase del examen de admisión 2025-II',
    createdAt: '2025-06-01',
  },
  {
    id: 'comunicado-velatorio-carlos-ballena',
    title: 'Comunicado: velatorio de Carlos Antonio Ballena Díaz',
    category: 'comunicado',
    categoryLabel: 'Comunicado',
    excerpt:
      'La institución informó a la comunidad educativa sobre el velatorio de Carlos Antonio Ballena Díaz.',
    paragraphs: [
      'El IESPP Peruano Canadiense comunicó a la comunidad educativa las disposiciones del velatorio de Carlos Antonio Ballena Díaz.',
      'El comunicado se publicó el 29 de septiembre de 2023 en el portal institucional.',
    ],
    image: 'images/pcanadiense/historia.jpg',
    imageAlt: 'Comunicado institucional del IESPP Peruano Canadiense',
    createdAt: '2023-09-29',
  },
  {
    id: 'curso-evaluacion-formativa-2023',
    title: 'Curso: Evaluación formativa',
    category: 'noticia',
    categoryLabel: 'Formación continua',
    excerpt:
      'Se desarrolló el curso de Evaluación formativa, con la participación de la Mgter. Rebeca Anijovich.',
    paragraphs: [
      'El 9 de septiembre de 2023 se realizó el curso de Evaluación formativa, orientado a fortalecer la retroalimentación en el aula.',
      'La jornada forma parte de la oferta de formación continua del instituto, con certificación válida para el escalafón docente.',
    ],
    image: 'images/pcanadiense/Mgter.%20Rebeca%20Anijovich.jpeg',
    imageAlt: 'Mgter. Rebeca Anijovich en el curso de Evaluación formativa',
    createdAt: '2023-09-09',
  },
  {
    id: 'capacitacion-habilidades-investigativas-2023',
    title: 'Capacitación en habilidades investigativas',
    category: 'noticia',
    categoryLabel: 'Investigación',
    excerpt:
      'Docentes y estudiantes participaron en una capacitación sobre competencias investigativas para la elaboración de tesis.',
    paragraphs: [
      'El 8 de septiembre de 2023 se realizó una capacitación en habilidades investigativas, con énfasis en la elaboración del informe de tesis.',
      'El área de Práctica e Investigación, a cargo de la Mg. María Patricia Toro López, impulsa estas jornadas de formación científica.',
    ],
    image: 'images/pcanadiense/Dra.%20Teresita%20Del%20Rosario%20Merino%20Salazar.jpeg',
    imageAlt: 'Capacitación en habilidades investigativas',
    createdAt: '2023-09-08',
  },
  {
    id: 'curso-proyecto-de-tesis-2023',
    title: 'Curso: Cómo elaborar un proyecto de tesis',
    category: 'noticia',
    categoryLabel: 'Investigación',
    excerpt:
      'Entre el 4 y el 12 de agosto de 2023 se dictó el curso sobre elaboración de proyectos de tesis.',
    paragraphs: [
      'El instituto ofreció el curso “Cómo elaborar un proyecto de tesis” del 4 al 12 de agosto de 2023.',
      'La actividad se inscribe en las líneas de investigación formativa y en el acompañamiento a tesistas de las carreras FID.',
    ],
    image: 'images/pcanadiense/x_seminario.jpg',
    imageAlt: 'Curso de elaboración de proyecto de tesis',
    createdAt: '2023-08-04',
  },
  {
    id: 'capacitacion-docentes-ebr-2023',
    title: 'Capacitación a docentes de EBR (120 horas)',
    category: 'noticia',
    categoryLabel: 'Formación continua',
    excerpt:
      'Los días 4 y 5 de agosto de 2023 se desarrolló una capacitación de 120 horas para docentes de Educación Básica Regular.',
    paragraphs: [
      'El 4 y 5 de agosto de 2023 el IESPP Peruano Canadiense ejecutó una capacitación de 120 horas dirigida a docentes de EBR.',
      'Las certificaciones de formación continua del instituto son válidas para escalafón y currículum docente.',
    ],
    image: 'images/pcanadiense/Ponentes.jpeg',
    imageAlt: 'Capacitación a docentes de Educación Básica Regular',
    createdAt: '2023-08-04',
  },
  {
    id: 'dia-de-la-peruanidad-2023',
    title: 'Día de la peruanidad 2023',
    category: 'evento',
    categoryLabel: 'Actividad',
    excerpt: 'El 26 y 27 de julio de 2023 la comunidad educativa celebró el Día de la peruanidad.',
    paragraphs: [
      'Los días 26 y 27 de julio de 2023 se realizaron las actividades por el Día de la peruanidad.',
      'La celebración forma parte del calendario institucional de convivencia y formación ciudadana.',
    ],
    image: 'images/pcanadiense/dia-bandera-02.jpg',
    imageAlt: 'Día de la peruanidad 2023',
    createdAt: '2023-07-26',
  },
  {
    id: 'maestro-canadiense-2023',
    title: 'Comunicado: Maestro Canadiense',
    category: 'comunicado',
    categoryLabel: 'Comunicado',
    excerpt: 'El 6 de julio de 2023 se publicó el comunicado institucional “Maestro Canadiense”.',
    paragraphs: [
      'El instituto difundió el 6 de julio de 2023 el comunicado “Maestro Canadiense”, dirigido a la comunidad educativa.',
      'El documento se publicó en el portal institucional junto a las actividades del Día del Maestro.',
    ],
    image: 'images/pcanadiense/docentes.jpg',
    imageAlt: 'Comunicado Maestro Canadiense',
    createdAt: '2023-07-06',
  },
  {
    id: 'jornada-licenciamiento-2023',
    title: 'Jornada de licenciamiento institucional',
    category: 'noticia',
    categoryLabel: 'Licenciamiento',
    excerpt:
      'El 26 de junio de 2023 se realizó una jornada de trabajo sobre el proceso de licenciamiento MINEDU.',
    paragraphs: [
      'El 26 de junio de 2023 el instituto desarrolló una jornada de licenciamiento, en el marco de la adecuación como Escuela de Educación Superior Pedagógica.',
      'El proceso se rige por la RVM-097-2022-MINEDU y la Ley N° 30512. El rectorado es MINEDU / DIFOID / DIGEDD, no SUNEDU.',
    ],
    image: 'images/pcanadiense/licenciamiento.jpg',
    imageAlt: 'Jornada de licenciamiento institucional',
    createdAt: '2023-06-26',
  },
  {
    id: 'sustentacion-tesis-motricidad-2023',
    title: 'Sustentación de tesis sobre motricidad gruesa',
    category: 'noticia',
    categoryLabel: 'Investigación',
    excerpt:
      'El 10 de junio de 2023 se sustentó la tesis sobre juegos motores y motricidad gruesa en niños de 5 años.',
    paragraphs: [
      'El 10 de junio de 2023 se sustentó la investigación “Juegos motores como estrategia didáctica para mejorar la motricidad gruesa en los niños y niñas de 5 años de la I.E.I. Kínder Chiquitines de Chiclayo - 2022”.',
      'El área de Práctica e Investigación registra esta y otras tesis en el repositorio institucional.',
    ],
    image: 'images/pcanadiense/sustentacion1.jpeg',
    imageAlt: 'Sustentación de tesis en el IESPP Peruano Canadiense',
    createdAt: '2023-06-10',
  },
  {
    id: 'imposicion-distintivos-2019-2023',
    title: 'Imposición de distintivos — promoción 2019-2023',
    category: 'evento',
    categoryLabel: 'Actividad',
    excerpt:
      'El 29 de abril de 2023 se realizó la ceremonia de imposición de distintivos a la promoción 2019-2023.',
    paragraphs: [
      'El 29 de abril de 2023 el instituto impuso los distintivos a la promoción 2019-2023 de Formación Inicial Docente.',
      'La ceremonia reconoce el tránsito de los estudiantes hacia la práctica preprofesional y el egreso.',
    ],
    image: 'images/pcanadiense/historia2.jpg',
    imageAlt: 'Imposición de distintivos a la promoción 2019-2023',
    createdAt: '2023-04-29',
  },
];
