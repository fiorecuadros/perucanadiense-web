import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AdminNavStore } from '../shared/admin-nav.store';

interface NavLink {
  label: string;
  route: string;
  icon: string;
}

interface NavGroup {
  label: string;
  items: NavLink[];
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly nav = inject(AdminNavStore);

  /** Riel contraído en escritorio (estado compartido con la topbar). */
  readonly colapsado = this.nav.colapsado;

  readonly dashboard: NavLink = {
    label: 'Dashboard',
    route: '/admin/dashboard',
    icon: 'fa-gauge-high',
  };

  readonly groups: NavGroup[] = [
    {
      label: 'Portal público',
      items: [
        { label: 'Contenido', route: '/admin/contenido', icon: 'fa-layer-group' },
        { label: 'Inicio', route: '/admin/inicio', icon: 'fa-house' },
        { label: 'Nosotros', route: '/admin/nosotros', icon: 'fa-landmark' },
        { label: 'Admisión', route: '/admin/admision', icon: 'fa-user-graduate' },
        { label: 'Becas y créditos', route: '/admin/becas', icon: 'fa-hand-holding-dollar' },
        { label: 'Costos', route: '/admin/costos', icon: 'fa-coins' },
        { label: 'Estadísticas', route: '/admin/estadisticas', icon: 'fa-chart-column' },
        { label: 'Horarios', route: '/admin/horarios', icon: 'fa-clock' },
        { label: 'Inversiones', route: '/admin/inversiones', icon: 'fa-building' },
        { label: 'Licenciamiento', route: '/admin/licenciamiento', icon: 'fa-stamp' },
      ],
    },
    {
      label: 'Páginas de servicio',
      items: [
        { label: 'Servicios', route: '/admin/servicios', icon: 'fa-hand-holding-heart' },
        { label: 'Transparencia', route: '/admin/transparencia', icon: 'fa-file-shield' },
        { label: 'Reglamentos', route: '/admin/reglamentos', icon: 'fa-gavel' },
        { label: 'Procedimientos', route: '/admin/procedimientos', icon: 'fa-list-check' },
        { label: 'Psicopedagógico', route: '/admin/psicopedagogico', icon: 'fa-brain' },
        { label: 'Servicio social', route: '/admin/servicio-social', icon: 'fa-handshake-angle' },
        { label: 'Soporte médico', route: '/admin/soporte-medico', icon: 'fa-kit-medical' },
        {
          label: 'Libro de reclamaciones',
          route: '/admin/pagina-reclamaciones',
          icon: 'fa-book',
        },
        { label: 'Privacidad', route: '/admin/privacidad', icon: 'fa-user-shield' },
        { label: 'Repositorio (beta)', route: '/admin/repositorio-copy', icon: 'fa-file-pen' },
        { label: 'Programas de estudio', route: '/admin/programas', icon: 'fa-graduation-cap' },
        { label: 'Menú de navegación', route: '/admin/menu', icon: 'fa-sitemap' },
      ],
    },
    {
      label: 'Gestión',
      items: [
        { label: 'Noticias', route: '/admin/noticias', icon: 'fa-newspaper' },
        { label: 'Comunicados', route: '/admin/comunicados', icon: 'fa-bullhorn' },
        { label: 'Personal y docentes', route: '/admin/personal', icon: 'fa-chalkboard-user' },
        { label: 'Contactos & Sedes', route: '/admin/contactos', icon: 'fa-address-book' },
        { label: 'Investigaciones', route: '/admin/investigaciones', icon: 'fa-flask' },
        { label: 'Documentos Transparencia', route: '/admin/documentos', icon: 'fa-folder-open' },
        { label: 'Mesa de Partes', route: '/admin/mesa-de-partes', icon: 'fa-envelope-open-text' },
        { label: 'Reclamaciones', route: '/admin/reclamaciones', icon: 'fa-scale-balanced' },
        { label: 'Reportes de accesibilidad', route: '/admin/accesibilidad', icon: 'fa-universal-access' },
        { label: 'Otras solicitudes', route: '/admin/solicitudes', icon: 'fa-inbox' },
        { label: 'Usuarios', route: '/admin/usuarios', icon: 'fa-users-gear' },
      ],
    },
  ];

  logout(): void {
    this.auth.logout();
  }
}
