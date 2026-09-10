import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContenidoStore } from '../../core/store/contenido.store';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Breadcrumbs } from '../../shared/components/breadcrumbs/breadcrumbs';
import { ButtonDirective } from '../../shared/ui';

@Component({
  selector: 'app-reglamentos',
  standalone: true,
  imports: [RouterLink, PageHero, Breadcrumbs, ButtonDirective],
  templateUrl: './reglamentos.component.html',
  styleUrls: ['../../shared/styles/service-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReglamentosComponent {
  readonly copy = inject(ContenidoStore).reglamentos.value;
  readonly categorias = computed(() => this.copy().categorias);
  readonly categoria = signal('todos');
  readonly busqueda = signal('');
  readonly crumbs = [{ label: 'Inicio', link: '/inicio' }, { label: 'Reglamentos' }];

  readonly filtrados = computed(() => {
    const categoria = this.categoria();
    const term = this.busqueda().trim().toLowerCase();
    return this.copy().items.filter((item) => {
      const matchCategoria = categoria === 'todos' || item.categoria === categoria;
      const matchTexto =
        !term ||
        item.titulo.toLowerCase().includes(term) ||
        item.descripcion.toLowerCase().includes(term);
      return matchCategoria && matchTexto;
    });
  });

  onSearch(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }
}
