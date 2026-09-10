import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Breadcrumbs } from '../../shared/components/breadcrumbs/breadcrumbs';
import { ButtonDirective } from '../../shared/ui';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [RouterLink, PageHero, Breadcrumbs, ButtonDirective],
  templateUrl: './no-encontrado.html',
  styleUrl: './no-encontrado.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoEncontrado {
  private readonly route = inject(ActivatedRoute);

  readonly recurso = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('recurso') ?? '')),
    { initialValue: '' },
  );

  readonly crumbs = [{ label: 'Inicio', link: '/inicio' }, { label: 'Error 404' }];

  readonly desdeDocumento = computed(() => this.recurso().startsWith('documento:'));

  readonly subtitle = computed(() => {
    const value = this.recurso();
    if (this.desdeDocumento()) {
      return `No hay un documento publicado para “${value.replace('documento:', '')}”.`;
    }
    if (value) {
      return `No existe la página “${value}”.`;
    }
    return 'La página o el archivo no existe o ya no está disponible.';
  });
}
