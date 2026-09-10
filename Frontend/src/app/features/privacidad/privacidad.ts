import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContenidoStore } from '../../core/store/contenido.store';
import { InstitutionService } from '../../core/services/institution.service';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Breadcrumbs } from '../../shared/components/breadcrumbs/breadcrumbs';
import { ButtonDirective } from '../../shared/ui';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [RouterLink, PageHero, Breadcrumbs, ButtonDirective],
  templateUrl: './privacidad.html',
  styleUrl: './privacidad.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Privacidad {
  private readonly institution = inject(InstitutionService);
  readonly info = this.institution.info;
  readonly copy = inject(ContenidoStore).privacidad.value;
  readonly crumbs = [{ label: 'Inicio', link: '/inicio' }, { label: 'Privacidad' }];

  parrafos(body: string): string[] {
    return String(body || '')
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
}
