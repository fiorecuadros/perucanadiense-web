import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../core/services/institution.service';
import { ContenidoStore } from '../../core/store/contenido.store';
import type { EmergenciaItem } from '../../core/constants/bienestar.constant';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Breadcrumbs } from '../../shared/components/breadcrumbs/breadcrumbs';
import { AlertComponent, ButtonDirective } from '../../shared/ui';

@Component({
  selector: 'app-soporte-medico',
  standalone: true,
  imports: [RouterLink, PageHero, Breadcrumbs, AlertComponent, ButtonDirective],
  templateUrl: './soporte-medico.component.html',
  styleUrls: ['../../shared/styles/service-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoporteMedicoComponent {
  private readonly institution = inject(InstitutionService);
  readonly info = this.institution.info;
  readonly copy = inject(ContenidoStore).soporteMedico.value;
  readonly servicios = computed(() => this.copy().servicios);
  readonly emergencias = computed(() => this.copy().emergencias);
  readonly whatsappUrl = this.institution.whatsappUrl;
  readonly crumbs = [
    { label: 'Inicio', link: '/inicio' },
    { label: 'Servicios', link: '/servicios' },
    { label: 'Soporte médico' },
  ];

  telefono(item: EmergenciaItem): string {
    return item.telefono?.trim() || this.info().contact.landline;
  }

  telHref(item: EmergenciaItem): string {
    const n = this.telefono(item).replace(/\D/g, '');
    return n ? `tel:${n}` : '#';
  }
}
