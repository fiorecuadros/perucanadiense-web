import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacidad.component.html',
  styleUrl: './privacidad.component.css',
})
export class PrivacidadComponent {
  fechaActualizacion = 'Enero 2025';

  politica = {
    titulo: 'Política de Privacidad y Protección de Datos Personales',
    institucion: 'IESPP Peruano Canadiense',
    direccion: 'Calle Francisco Cabrera #1288, Chiclayo, PERÚ',
    email: 'informes@pcanadiense.edu.pe',
    telefono: '+074 239644',
  };

  principios = [
    {
      titulo: 'Legalidad',
      descripcion:
        'El tratamiento de datos personales se realiza conforme a las disposiciones establecidas en la Ley N° 29733, Ley de Protección de Datos Personales y su Reglamento.',
    },
    {
      titulo: 'Consentimiento',
      descripcion:
        'Recabamos su consentimiento informado, previo, expreso y por escrito para el tratamiento de sus datos personales.',
    },
    {
      titulo: 'Finalidad',
      descripcion:
        'Los datos personales son recolectados para fines específicos, explícitos y legítimos relacionados con los servicios educativos y administrativos de la institución.',
    },
    {
      titulo: 'Proporcionalidad',
      descripcion:
        'Solo recolectamos datos personales que son pertinentes, adecuados y necesarios para los fines para los cuales son tratados.',
    },
    {
      titulo: 'Seguridad',
      descripcion:
        'Implementamos medidas técnicas y organizativas para garantizar la seguridad de los datos personales y evitar su pérdida, uso indebido o acceso no autorizado.',
    },
  ];

  datosRecolectados = [
    {
      categoria: 'Datos de Identificación',
      datos: [
        'Nombres y apellidos',
        'Documento de identidad (DNI)',
        'Fecha de nacimiento',
        'Dirección domiciliaria',
      ],
    },
    {
      categoria: 'Datos de Contacto',
      datos: ['Teléfono fijo y móvil', 'Correo electrónico', 'Redes sociales (si aplica)'],
    },
    {
      categoria: 'Datos Académicos',
      datos: [
        'Historial académico',
        'Programa de estudios',
        'Calificaciones y evaluaciones',
        'Certificados y constancias',
      ],
    },
    {
      categoria: 'Datos Administrativos',
      datos: [
        'Documentación de matrícula',
        'Pagos y pensiones',
        'Trámites administrativos',
        'Solicitudes y requerimientos',
      ],
    },
  ];

  finalidades = [
    'Gestión de procesos de admisión y matrícula',
    'Administración académica y evaluación',
    'Emisión de certificados y constancias',
    'Comunicación institucional',
    'Gestión de trámites administrativos',
    'Estadísticas y reportes institucionales',
    'Cumplimiento de obligaciones legales',
  ];

  derechos = [
    {
      derecho: 'Derecho de Acceso',
      descripcion:
        'Solicitar información sobre si sus datos personales son tratados por la institución.',
    },
    {
      derecho: 'Derecho de Rectificación',
      descripcion:
        'Solicitar la corrección o actualización de sus datos personales cuando sean inexactos o incompletos.',
    },
    {
      derecho: 'Derecho de Cancelación',
      descripcion:
        'Solicitar la eliminación de sus datos personales cuando ya no sean necesarios para los fines para los cuales fueron recolectados.',
    },
    {
      derecho: 'Derecho de Oposición',
      descripcion: 'Oponerse al tratamiento de sus datos personales por motivos legítimos.',
    },
    {
      derecho: 'Derecho de Portabilidad',
      descripcion: 'Solicitar que sus datos personales sean transferidos a otra entidad.',
    },
  ];

  contactoPrivacidad = {
    email: 'informes@pcanadiense.edu.pe',
    telefono: '+074 239644',
    direccion: 'Calle Francisco Cabrera #1288, Chiclayo, PERÚ',
  };
}
