export interface PrivacySection {
  title: string;
  body: string;
}

export interface PrivacyContent {
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  sections: PrivacySection[];
}

export const PRIVACY_COPY: PrivacyContent = {
  heroTitle: 'Política de privacidad',
  heroSubtitle: 'Protección de datos personales — Ley N.° 29733',
  intro:
    'El Instituto de Educación Superior Pedagógico Privado “Peruano Canadiense” (RUC 20606550937) trata datos personales de postulantes, estudiantes, egresados, docentes y público en general para atender trámites institucionales, de conformidad con la Ley N.° 29733, Ley de Protección de Datos Personales, y su reglamento.',
  sections: [
    {
      title: 'Titular del banco de datos',
      body: 'El titular es el IESPP Peruano Canadiense, con sedes en Calle Francisco Cabrera #1288, Chiclayo, y Prolongación Grau Km. 0, Carretera Monsefú–La Victoria. Correo de informes: informes@pcanadiense.edu.pe. Teléfono: +074 239644.',
    },
    {
      title: 'Finalidad del tratamiento',
      body: 'Los datos se recaban para gestionar admisión, matrícula, mesa de partes, libro de reclamaciones, comunicaciones institucionales y el entorno virtual de aprendizaje Microsoft 365. No se venden ni se ceden con fines comerciales.',
    },
    {
      title: 'Datos que recabamos',
      body: 'En admisión y mesa de partes se solicitan nombres, DNI o RUC, domicilio, teléfono, correo, condición (estudiante, docente, egresado u otro), asunto del trámite y documentos de sustento. El EVA asigna correo institucional @pcanadiense.edu.pe.',
    },
    {
      title: 'Plazo de conservación',
      body: 'Los expedientes se conservan el tiempo necesario para el trámite, las obligaciones académicas y las normas de archivo de educación superior. Superado ese plazo se eliminan o se archivan según la normativa aplicable.',
    },
    {
      title: 'Derechos ARCO',
      body: 'El titular de los datos puede ejercer acceso, rectificación, cancelación y oposición a través de la Mesa de Partes Virtual o del correo mesa-de-partes-virtual@pcanadiense.edu.pe, identificándose con DNI y precisando el derecho que solicita.',
    },
  ],
};
