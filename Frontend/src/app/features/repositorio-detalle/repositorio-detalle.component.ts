import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContenidoStore } from '../../core/store/contenido.store';
import { RepositorioService } from '../../core/services/repositorio.service';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Breadcrumbs } from '../../shared/components/breadcrumbs/breadcrumbs';
import { AlertComponent, ButtonDirective } from '../../shared/ui';
import { VisorPdf } from '../../admin/shared/visor-pdf/visor-pdf';

@Component({
  selector: 'app-repositorio-detalle',
  standalone: true,
  imports: [RouterLink, PageHero, Breadcrumbs, AlertComponent, ButtonDirective, VisorPdf],
  templateUrl: './repositorio-detalle.component.html',
  styleUrls: ['../../shared/styles/service-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepositorioDetalleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repo = inject(RepositorioService);

  readonly copy = inject(ContenidoStore).repositorioCopy.value;
  readonly id = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  readonly item = computed(() => this.repo.porId(this.id()));
  readonly relacionados = computed(() => this.repo.relacionados(this.id()));

  readonly crumbs = computed(() => [
    { label: 'Inicio', link: '/inicio' },
    { label: 'Repositorio', link: '/repositorio' },
    { label: this.item()?.programa ?? 'Detalle' },
  ]);

  constructor() {
    effect(() => {
      const id = this.id();
      if (id && !this.repo.porId(id)) {
        void this.router.navigate(['/no-encontrado'], { queryParams: { recurso: id } });
      }
    });
  }

  hrefPdf(url: string): string {
    if (url.startsWith('/api/') || url.startsWith('/archivos/')) {
      return `${environment.baseUrl}${url}`;
    }
    return url;
  }
}
