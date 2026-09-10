/**
 * Directorio Oficial de Autoridades, Jerárquicos, Administrativos y Docentes
 * IESPP Peruano Canadiense (Chiclayo)
 */

export interface FacultyMember {
  id: number;
  type: 'Autoridad' | 'Administrativo' | 'Docente';
  names: string;
  lastNames: string;
  position: string;
  area?: string;
  grade: string;
  email: string;
  image?: string;
  cvUrl?: string;
  order: number;
}

export const FACULTY_MEMBERS: FacultyMember[] = [
  // AUTORIDADES Y JERÁRQUICOS
  {
    id: 1,
    type: 'Autoridad',
    names: 'Jorge Luis',
    lastNames: 'Meoño Ballena',
    position: 'Director General',
    area: 'Dirección General',
    grade: 'Doctor en Educación',
    // La `ñ` no es válida en direcciones de correo en la práctica.
    // Se deja sin `image` para que la foto se rellene desde el panel
    // cuando esté disponible (evita 404 por archivos inexistentes).
    email: 'jmeono@pcanadiense.edu.pe',
    order: 1,
  },
  {
    id: 2,
    type: 'Autoridad',
    names: 'Miguel Luis',
    lastNames: 'Ballena Díaz',
    position: 'Jefe de Unidad Académica',
    area: 'Unidad Académica',
    grade: 'Magíster en Gestión Educativa',
    email: 'mballena@pcanadiense.edu.pe',
    order: 2,
  },
  {
    id: 3,
    type: 'Autoridad',
    names: 'Celinda Milagros',
    lastNames: 'Anaya Chávez',
    position: 'Coordinadora Académica de Educación Inicial',
    area: 'Educación Inicial',
    grade: 'Magíster en Educación',
    email: 'canaya@pcanadiense.edu.pe',
    order: 3,
  },
  {
    id: 4,
    type: 'Autoridad',
    names: 'Elsa María',
    lastNames: 'Vásquez de Martínez',
    position: 'Coordinadora Académica de Educación Primaria',
    area: 'Educación Primaria',
    grade: 'Magíster en Educación',
    email: 'evasquez@pcanadiense.edu.pe',
    order: 4,
  },
  {
    id: 5,
    type: 'Autoridad',
    names: 'Luis Alberto',
    lastNames: 'Deza Figueroa',
    position: 'Secretario Académico',
    area: 'Secretaría Académica',
    grade: 'Magíster en Administración',
    email: 'ldeza@pcanadiense.edu.pe',
    order: 5,
  },
  {
    id: 6,
    type: 'Autoridad',
    names: 'María Valentina',
    lastNames: 'Córdova Pissani',
    position: 'Jefa del Área de Calidad',
    area: 'Aseguramiento de la Calidad',
    grade: 'Magíster en Calidad Educativa',
    email: 'mcordova@pcanadiense.edu.pe',
    order: 6,
  },
  {
    id: 7,
    type: 'Autoridad',
    names: 'María Patricia',
    lastNames: 'Toro López',
    position: 'Jefa de Práctica e Investigación',
    area: 'Investigación y Práctica Preprofesional',
    grade: 'Magíster en Investigación Pedagógica',
    email: 'mtoro@pcanadiense.edu.pe',
    order: 7,
  },
  {
    id: 8,
    type: 'Autoridad',
    names: 'Juan Carlos',
    lastNames: 'Díaz Díaz',
    position: 'Jefe de Bienestar y Empleabilidad',
    area: 'Bienestar Estudiantil',
    grade: 'Magíster en Psicología Educativa',
    email: 'jdiazdiaz@pcanadiense.edu.pe',
    order: 8,
  },

  // PERSONAL ADMINISTRATIVO
  {
    id: 9,
    type: 'Administrativo',
    names: 'José',
    lastNames: 'Ballena Guevara',
    position: 'Administrador General',
    area: 'Administración',
    grade: 'Licenciado en Administración',
    email: 'jballena@pcanadiense.edu.pe',
    order: 9,
  },
  {
    id: 10,
    type: 'Administrativo',
    names: 'Carlos',
    lastNames: 'Celis Reátegui',
    position: 'Tesorero',
    area: 'Tesorería y Finanzas',
    grade: 'Contador Público Colegiado',
    email: 'ccelis@pcanadiense.edu.pe',
    order: 10,
  },
  {
    id: 11,
    type: 'Administrativo',
    names: 'Brenda',
    lastNames: 'Fernández Enríquez',
    position: 'Secretaria General',
    area: 'Secretaría General',
    grade: 'Técnico en Secretariado Ejecutivo',
    email: 'bfernandez@pcanadiense.edu.pe',
    order: 11,
  },
  {
    id: 12,
    type: 'Administrativo',
    names: 'Nicoll',
    lastNames: 'Gómez Rojas',
    position: 'Secretaria J.U.A.',
    area: 'Jefatura de Unidad Académica',
    grade: 'Técnico en Administración',
    email: 'ngomez@pcanadiense.edu.pe',
    order: 12,
  },
  {
    id: 13,
    type: 'Administrativo',
    names: 'Miguel Ángel',
    lastNames: 'Córdova Guevara',
    position: 'Diseñador Gráfico y Audiovisual',
    area: 'Comunicaciones y Medios',
    grade: 'Técnico en Diseño Digital',
    email: 'mcordovague@pcanadiense.edu.pe',
    order: 13,
  },

  // PLANA DOCENTE SELECCIONADA
  {
    id: 14,
    type: 'Docente',
    names: 'Geraldine',
    lastNames: 'Bonarrigo Romero',
    position: 'Docente de Educación Inicial',
    area: 'Educación Inicial',
    grade: 'Licenciada en Educación Inicial',
    email: 'gbonarrigo@pcanadiense.edu.pe',
    order: 14,
  },
  {
    id: 15,
    type: 'Docente',
    names: 'Martha',
    lastNames: 'Saavedra de Díaz',
    position: 'Docente Formador de Práctica',
    area: 'Práctica Preprofesional',
    grade: 'Licenciada en Educación',
    email: 'msaavedra@pcanadiense.edu.pe',
    order: 15,
  },
  {
    id: 16,
    type: 'Docente',
    names: 'Juan',
    lastNames: 'Saavedra Cubas',
    position: 'Docente de Matemática y Ciencias',
    area: 'Educación Secundaria Matemática',
    grade: 'Magíster en Didáctica de las Matemáticas',
    email: 'jsaavedra@pcanadiense.edu.pe',
    order: 16,
  },
  {
    id: 17,
    type: 'Docente',
    names: 'Braulio',
    lastNames: 'Tello Flores',
    position: 'Docente de Ciencias Sociales y Ciudadanía',
    area: 'Educación Secundaria CC.SS.',
    grade: 'Licenciado en Ciencias Sociales',
    email: 'btello@pcanadiense.edu.pe',
    order: 17,
  },
  {
    id: 18,
    type: 'Docente',
    names: 'Wilmer',
    lastNames: 'Mundaca Monja',
    position: 'Docente de Tecnologías e Innovación',
    area: 'Área de TIC y Educación',
    grade: 'Ingeniero de Sistemas y Educador',
    email: 'wmundaca@pcanadiense.edu.pe',
    order: 18,
  },
  {
    id: 19,
    type: 'Docente',
    names: 'Patricia',
    lastNames: 'Millones Castro',
    position: 'Docente de Didáctica de Comunicación',
    area: 'Educación Primaria',
    grade: 'Licenciada en Educación Primaria',
    email: 'pmillones@pcanadiense.edu.pe',
    order: 19,
  },
];
