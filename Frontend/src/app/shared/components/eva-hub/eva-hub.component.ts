import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionService } from '../../../core/services/institution.service';

@Component({
  selector: 'app-eva-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eva-hub.component.html',
  styleUrl: './eva-hub.component.css',
})
export class EvaHubComponent {
  private institutionService = inject(InstitutionService);
  readonly info = this.institutionService.info;

  readonly services = [
    {
      icon: 'fa-laptop',
      title: 'Plataforma Virtual M365',
      desc: 'Ecosistema corporativo Microsoft 365 con herramientas colaborativas para potenciar el desempeño académico.',
      link: 'https://www.office.com/',
      cta: 'Ingresar a Office 365',
    },
    {
      icon: 'fa-chalkboard-teacher',
      title: 'Aula Virtual Teams',
      desc: 'Herramienta de videoconferencias, gestión de tareas y comunicación didáctica síncrona y asíncrona.',
      link: 'https://teams.microsoft.com/',
      cta: 'Entrar a Teams',
    },
    {
      icon: 'fa-envelope',
      title: 'Correo Institucional',
      desc: 'Cuentas @pcanadiense.edu.pe en Outlook para comunicación oficial entre estudiantes, docentes y secretaría.',
      link: 'https://outlook.office.com/mail/',
      cta: 'Revisar mi Correo',
    },
    {
      icon: 'fa-comments',
      title: 'Red Social Institucional',
      desc: 'Comunidades de aprendizaje virtual y grupos de interés académico en Yammer / Viva Engage.',
      link: 'https://web.yammer.com/main/org/pcanadiense.edu.pe/',
      cta: 'Unirse a la Red',
    },
    {
      icon: 'fa-book-reader',
      title: 'Biblioteca Virtual',
      desc: 'Acceso a más de 3,000 libros electrónicos, tesis y revistas especializadas de investigación pedagógica.',
      link: '/repositorio',
      cta: 'Explorar Catálogo',
    },
    {
      icon: 'fa-file-alt',
      title: 'Manuales y Guías EVA',
      desc: 'Guías paso a paso para el uso de la plataforma según tu perfil: estudiante, docente o administrativo.',
      link: 'https://pcanadiense-my.sharepoint.com/',
      cta: 'Ver Manuales',
    },
  ];
}
