export type AboutPillarId = 'mision' | 'vision' | 'valores' | 'organigrama';

export interface AboutContent {
  heroTitle: string;
  heroLead: string;
  mission: string;
  vision: string;
  /** Valores institucionales (HTML enriquecido). Antes eran pares nombre/definición. */
  valuesText: string;
  organigrama: { src: string; alt: string };
  historiaImage: { src: string; alt: string };
  historyLead: string;
  /** Detalle de la historia (HTML enriquecido). Antes eran hitos estructurados. */
  historyTimeline: string;
}

export const ABOUT_TABS = [
  { id: 'identidad', label: 'Portada' },
  { id: 'pilares', label: 'Misión y visión' },
  { id: 'historia', label: 'Historia' },
] as const;

export const ABOUT_COPY: AboutContent = {
  heroTitle: 'Nosotros',
  heroLead:
    '31 años formando maestros con identidad regional, valores cristianos y título a nombre de la Nación.',
  mission:
    'El IESPP “PERUANO CANADIENSE” basa su proceso formativo en el perfil profesional de una educación de calidad, con líderes e identidad regional, práctica de valores cristianos que aporta a través de la práctica e investigación el desarrollo sustentable de la región y el país.',
  vision:
    'Al 2029 somos una Escuela de Educación Superior Pedagógico Privado Peruano Canadiense, con excelencia educativa que ejerce liderazgo en la formación de profesionales con calidad, identidad, valores cristianos y base científica-tecnológica, que aporta al desarrollo sostenible de la región y el país.',
  valuesText: [
    '<ul>',
    '<li><strong>Libertad.</strong> Capacidad del ser humano de actuar según sus valores, criterios, razón y voluntad.</li>',
    '<li><strong>Justicia.</strong> Bien común que busca lo mejor para todos.</li>',
    '<li><strong>Equidad.</strong> Igualdad de oportunidad y trato justo a las personas, dando a cada cual lo que le pertenece.</li>',
    '<li><strong>Honestidad.</strong> Implica mostrar respeto hacia los demás y tener integridad y conciencia de sí mismo.</li>',
    '<li><strong>Solidaridad.</strong> Colaboración mutua entre las personas.</li>',
    '<li><strong>Responsabilidad.</strong> Capacidad de las personas de actuar de la manera correcta y comprometerse con propósitos conjuntos.</li>',
    '</ul>',
  ].join(''),
  organigrama: {
    src: 'images/pcanadiense/organigrama.jpg',
    alt: 'Organigrama institucional del IESPP Peruano Canadiense',
  },
  historiaImage: {
    src: 'images/pcanadiense/historia.jpg',
    alt: 'Sede e historia del IESPP Peruano Canadiense',
  },
  historyLead:
    'El Instituto de Educación Superior Pedagógico Privado “Peruano Canadiense” fue creado por Decreto Supremo N° 04-95-ED, del 11 de enero de 1995. Su promotor y fundador es el Mg. William José Ballena Díaz; el Director General actual es el Dr. Jorge Luis Meoño Ballena. Cumple 31 años formando docentes en Lambayeque, con sede en Chiclayo y campus en la carretera Monsefú–La Victoria.',
  historyTimeline: [
    '<ul>',
    '<li><strong>1993 · Escuela Santa Leonor.</strong> El 10 de diciembre se expide la Resolución N° 1722-93-DRE-ED creando la escuela “Santa Leonor” en Chiclayo (inicial y primaria), semilla del proyecto pedagógico.</li>',
    '<li><strong>1994 · Expediente ante el MINEDU.</strong> Se elabora y eleva el Expediente N° 705333-94 para la creación del instituto pedagógico.</li>',
    '<li><strong>1995 · Creación oficial.</strong> El 11 de enero, mediante D.S. N° 04-95-ED, se autoriza la creación y funcionamiento del IESPP “Peruano Canadiense”. El 13 de marzo se convoca el primer examen de admisión, con ceremonia en el salón consistorial de la Municipalidad de Monsefú.</li>',
    '<li><strong>2000 · Centro de Aplicación.</strong> La Resolución N° 459-200-CTAR/LAMB del 25 de octubre apertura el Centro de Aplicación “Peruano Canadiense”. La DREL autoriza el traslado a la sede central de Chiclayo.</li>',
    '<li><strong>2003–2004 · Mejoramiento institucional.</strong> Se implementa el Plan de Mejoramiento Institucional, se crea el Colegio de Aplicación de secundaria y se renueva el sistema de admisión.</li>',
    '<li><strong>2010 · Denominación IESPP y DCBN.</strong> La R.D.R.S. N° 2643-2010-GR-LAM/DREL formaliza la denominación de Instituto de Educación Superior Pedagógico Privado. Se adopta el DCBN (R.D. 0165-2010-ED) con enfoque por competencias.</li>',
    '<li><strong>2015–2024 · Modernización y licenciamiento.</strong> Nueva etapa de modernización educativa y adecuación como Escuela de Educación Superior Pedagógica (EESP), en el marco de la Ley N° 30512 y la RVM-097-2022-MINEDU.</li>',
    '</ul>',
  ].join(''),
};
