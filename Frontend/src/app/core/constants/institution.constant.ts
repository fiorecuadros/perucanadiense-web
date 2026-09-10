/**
 * Constantes y Datos Oficiales del IESPP "Peruano Canadiense" (Chiclayo, Lambayeque)
 * Fuente: Portal institucional, base legal MINEDU y R.D.R.S. N° 2643-2010-GR-LAM/DREL.
 */

export const INSTITUTION = {
  name: 'Instituto de Educación Superior Pedagógico Privado "Peruano Canadiense"',
  shortName: 'IESPP Peruano Canadiense',
  acronym: 'IESPP PC',
  type: 'Privado',
  slogan: '¡Decídete y ponle un Título a tu Historia!',
  tagline: 'Estudia educación y transforma el futuro',
  legalCategory: 'Instituto de Educación Superior Pedagógico Privado',
  ruc: '20606550937',
  modularCode: '0421123',
  localCode: '0499999',
  yearsOfExperience: 31,
  foundationYear: 1995,
  foundationDate: '11 de enero de 1995',
  legalDecree: 'Decreto Supremo N° 04-95-ED',
  licensingNorm: 'RVM-097-2022-MINEDU',
  governingBody: 'Ministerio de Educación (MINEDU) - DIFOID / DIGEDD',
  regionalOffice: 'Dirección Regional de Educación de Lambayeque (DREL)',
  ugel: 'UGEL Chiclayo',

  locations: [
    {
      id: 'central',
      name: 'Local Central',
      address: 'Calle Francisco Cabrera #1288',
      city: 'Chiclayo',
      region: 'Lambayeque',
      country: 'Perú',
      reference: 'A 4 cuadras del centro cívico de Chiclayo',
    },
    {
      id: 'campus',
      name: 'Nuevo Campus Institucional',
      address: 'Prolongación Grau Km. 0, Carretera Monsefú - La Victoria',
      city: 'Chiclayo',
      region: 'Lambayeque',
      country: 'Perú',
      reference: 'Eje ecológico educativo carretera Monsefú',
    },
  ],

  contact: {
    landline: '+074 239644',
    phoneFormatted: '(074) 23-9644',
    whatsapp: '938146082',
    whatsappFormatted: '+51 938 146 082',
    whatsappMessage:
      'Hola, deseo recibir información sobre las carreras pedagógicas y el proceso de admisión en el IESPP Peruano Canadiense.',
    emailGeneral: 'informes@pcanadiense.edu.pe',
    emailIntake: 'mdp.pcanadiense@gmail.com',
    emailAdmin: 'mesa-de-partes-virtual@pcanadiense.edu.pe',
  },

  schedule: {
    attention: 'Lunes a viernes: 8:00 a.m. a 1:00 p.m.',
    classesPresential: 'Lunes a viernes: 3:00 p.m. a 7:00 p.m.',
  },

  social: {
    facebook: 'https://www.facebook.com/ispperuanocanadiense/',
    youtube: 'https://www.youtube.com/',
    instagram: 'https://www.instagram.com/',
    linkedin: 'https://www.linkedin.com/',
  },

  ecosystemEVA: {
    title: 'Entorno Virtual de Aprendizaje (EVA)',
    description:
      'Ecosistema digital corporativo basado en Microsoft 365 para docentes y estudiantes.',
    office365: 'https://www.office.com/',
    teams: 'https://teams.microsoft.com/',
    outlook: 'https://outlook.office.com/mail/',
    yammer: 'https://web.yammer.com/main/org/pcanadiense.edu.pe/',
    virtualLibrary: '#',
    repository: '#',
    manualsSharepoint: 'https://pcanadiense-my.sharepoint.com/',
  },

  metrics2025: {
    period: '2025-II',
    teachersCount: 35,
    studentsCount: 469,
    enrolledCount: 176,
    admittedCount: 180,
    campusAreaM2: 2000,
  },

  bankAccounts: [
    {
      bank: 'Banco de la Nación',
      accountType: 'Cuenta Corriente',
      accountNumber: '04-040-299489',
      cci: '018-000-004040299489-07',
      holder: 'Carlos Celis Reátegui (Tesorero)',
    },
    {
      bank: 'Cuenta Institucional IPEC',
      accountType: 'Cuenta Empresarial',
      accountNumber: '3058968234028',
      cci: '002-330-5008968234028-19',
      holder: 'Instituto de Educación Superior IPEC',
    },
  ],

  fees: {
    admissionExam: 200,
    enrollment: 200,
    monthlyTuition: 200,
    reinstatement: 150,
  },
} as const;

export type InstitutionFees = {
  admissionExam: number;
  enrollment: number;
  monthlyTuition: number;
  reinstatement: number;
};

export type InstitutionBankAccount = {
  bank: string;
  accountType: string;
  accountNumber: string;
  cci: string;
  holder: string;
};

