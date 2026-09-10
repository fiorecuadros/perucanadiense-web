/**
 * Copy de la portada. Semilla del store de contenido de Inicio.
 */

export type InicioDocKind = 'hero' | 'servicios' | 'logos';

export interface InicioDoc {
  id: InicioDocKind;
  label: string;
}

export const INICIO_DOCS: readonly InicioDoc[] = [
  { id: 'hero', label: 'Portada' },
  { id: 'servicios', label: 'Otros servicios' },
  { id: 'logos', label: 'Logos institucionales' },
];

export interface InicioHeroImage {
  src: string;
  alt: string;
}

export interface InicioService {
  src: string;
  title: string;
  alt: string;
}

export interface InicioLogo {
  image: string;
  url: string;
  alt: string;
}

export interface InicioContent {
  heroImages: InicioHeroImage[];
  licensingImage: InicioHeroImage;
  services: InicioService[];
  logos: InicioLogo[];
}

export const INICIO_COPY: InicioContent = {
  heroImages: [
    {
      src: 'images/pcanadiense/Fondo1.jpeg',
      alt: 'Comunidad educativa del IESPP Peruano Canadiense en Chiclayo',
    },
    {
      src: 'images/pcanadiense/programas.jpg',
      alt: 'Programas de estudio del IESPP Peruano Canadiense',
    },
    {
      src: 'images/pcanadiense/inicial.jpg',
      alt: 'Formación docente en Educación Inicial',
    },
  ],
  licensingImage: {
    src: 'images/pcanadiense/licenciamiento.jpg',
    alt: 'Ficha de licenciamiento MINEDU',
  },
  services: [
    {
      src: 'images/pcanadiense/computacion-1.jpg',
      title: 'Carreras Técnicas',
      alt: 'Carreras técnicas del IESPP Peruano Canadiense',
    },
    {
      src: 'images/pcanadiense/x_seminario.jpg',
      title: 'Formación Continua',
      alt: 'Formación continua y seminarios institucionales',
    },
  ],
  logos: [
    {
      image: 'images/pcanadiense/logo_minedu.png',
      url: 'https://www.gob.pe/minedu',
      alt: 'Ministerio de Educación',
    },
    {
      image: 'images/pcanadiense/logo_difoid.png',
      url: 'https://www.minedu.gob.pe/superiorpedagogica/',
      alt: 'DIFOID — Educación Superior Pedagógica',
    },
    {
      image: 'images/pcanadiense/logo_sia.png',
      url: 'https://www.gob.pe/minedu',
      alt: 'Sistema de Información Académica',
    },
    {
      image: 'images/pcanadiense/logo_bnp.png',
      url: 'https://www.bnp.gob.pe/',
      alt: 'Biblioteca Nacional del Perú',
    },
    {
      image: 'images/pcanadiense/logo%20perueduca.jpg',
      url: 'https://www.perueduca.pe/',
      alt: 'PerúEduca',
    },
    {
      image: 'images/pcanadiense/logo_M365.png',
      url: 'https://www.office.com/',
      alt: 'Microsoft 365',
    },
  ],
};
