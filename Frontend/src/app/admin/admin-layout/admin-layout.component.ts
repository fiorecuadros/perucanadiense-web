import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PortalSync } from '../../core/api/portal-sync';
import { AuthService } from '../../core/auth/auth.service';
import { AdminNavStore } from '../shared/admin-nav.store';
import { ToastHost } from '../shared/toast/toast-host';
import { AdminSidebarComponent } from '../sidebar/sidebar.component';

const ROUTE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/contenido': 'Contenido del portal',
  '/admin/inicio': 'Inicio',
  '/admin/admision': 'Admisión',
  '/admin/becas': 'Becas y créditos',
  '/admin/costos': 'Costos',
  '/admin/estadisticas': 'Estadísticas',
  '/admin/horarios': 'Horarios',
  '/admin/inversiones': 'Inversiones',
  '/admin/licenciamiento': 'Licenciamiento',
  '/admin/nosotros': 'Nosotros',
  '/admin/servicios': 'Servicios',
  '/admin/transparencia': 'Transparencia',
  '/admin/reglamentos': 'Reglamentos',
  '/admin/procedimientos': 'Procedimientos',
  '/admin/psicopedagogico': 'Psicopedagógico',
  '/admin/servicio-social': 'Servicio social',
  '/admin/soporte-medico': 'Soporte médico',
  '/admin/pagina-reclamaciones': 'Página de reclamaciones',
  '/admin/privacidad': 'Privacidad',
  '/admin/repositorio-copy': 'Textos del repositorio',
  '/admin/programas': 'Programas de estudio',
  '/admin/menu': 'Menú de navegación',
  '/admin/noticias': 'Noticias',
  '/admin/comunicados': 'Comunicados',
  '/admin/personal': 'Personal y docentes',
  '/admin/contactos': 'Contactos',
  '/admin/investigaciones': 'Investigaciones',
  '/admin/documentos': 'Documentos',
  '/admin/mesa-de-partes': 'Mesa de partes',
  '/admin/reclamaciones': 'Reclamaciones',
  '/admin/solicitudes': 'Otras solicitudes',
  '/admin/usuarios': 'Usuarios',
  '/admin/mi-cuenta': 'Mi cuenta',
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AdminSidebarComponent, ToastHost],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly sync = inject(PortalSync);
  private readonly auth = inject(AuthService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly nav = inject(AdminNavStore);

  readonly pageTitle = signal('Dashboard');
  readonly usuario = this.auth.usuario;
  readonly menuAbierto = signal(false);
  /** Cajón de navegación en móvil. */
  readonly navAbierto = this.nav.cajonAbierto;
  /** Riel contraído en escritorio. */
  readonly colapsado = this.nav.colapsado;

  readonly hoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  readonly iniciales = computed(() => {
    const nombre = this.usuario()?.nombre?.trim();
    if (!nombre) return 'PC';
    const partes = nombre.split(/\s+/).filter(Boolean);
    const dos = (partes[0][0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '');
    return dos.toUpperCase() || 'PC';
  });

  readonly rolEtiqueta = computed(() =>
    this.usuario()?.rol === 'admin' ? 'Administrador' : 'Editor',
  );

  constructor() {
    // Hidratar datos solo una vez al cargar el layout
    void this.sync.hydrateAdmin();
    
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        this.pageTitle.set(ROUTE_TITLES[e.urlAfterRedirects] ?? 'Admin');
        this.menuAbierto.set(false);
        this.nav.cerrarCajon();
        
        // Scroll to top on navigation for better UX
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  /**
   * Botón hamburguesa de la topbar: en móvil abre/cierra el cajón deslizante;
   * en escritorio contrae/expande el riel lateral.
   */
  alternarNav(): void {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches) {
      this.nav.alternarCajon();
    } else {
      this.nav.alternarColapso();
    }
  }

  cerrarSesion(): void {
    this.menuAbierto.set(false);
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  cerrarSiClicFuera(evento: MouseEvent): void {
    if (!this.menuAbierto()) return;
    const menu = this.host.nativeElement.querySelector('.usermenu');
    if (menu && !menu.contains(evento.target as Node)) this.menuAbierto.set(false);
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    this.menuAbierto.set(false);
    this.nav.cerrarCajon();
  }
}
