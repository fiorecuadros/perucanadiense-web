import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../core/services/institution.service';
import { MenuStore } from '../../core/store/menu.store';
import { EnlaceMenu } from '../enlace-menu/enlace-menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, EnlaceMenu],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly institution = inject(InstitutionService);
  private readonly menu = inject(MenuStore);

  readonly info = this.institution.info;
  // Los enlaces salen del panel (/admin/menu); si el API no responde, el store
  // conserva el menú oficial y la cabecera nunca queda vacía.
  readonly enlaces = this.menu.principal;
  readonly acciones = this.menu.acciones;
  readonly isMenuOpen = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar')) {
      this.isMenuOpen.set(false);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (typeof window !== 'undefined' && window.innerWidth >= 992 && this.isMenuOpen()) {
      this.isMenuOpen.set(false);
    }
  }
}
