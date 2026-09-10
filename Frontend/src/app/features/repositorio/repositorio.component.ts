import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContenidoStore } from '../../core/store/contenido.store';
import { RepositorioService } from '../../core/services/repositorio.service';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Breadcrumbs } from '../../shared/components/breadcrumbs/breadcrumbs';
import { stripHtml } from '../../core/utils/html';

@Component({
  selector: 'app-repositorio',
  standalone: true,
  imports: [RouterLink, PageHero, Breadcrumbs],
  templateUrl: './repositorio.component.html',
  styleUrls: ['../../shared/styles/service-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepositorioComponent {
  private readonly repo = inject(RepositorioService);

  readonly copy = inject(ContenidoStore).repositorioCopy.value;
  readonly programas = this.repo.programas;
  readonly anios = this.repo.anios;
  readonly programa = signal('todos');
  readonly anio = signal('todos');
  readonly busqueda = signal('');
  readonly crumbs = [
    { label: 'Inicio', link: '/inicio' },
    { label: 'Servicios', link: '/servicios' },
    { label: 'Repositorio' },
  ];

  readonly filtrados = computed(() => {
    const programa = this.programa();
    const anio = this.anio();
    const term = this.busqueda().trim().toLowerCase();
    return this.repo.all().filter((item) => {
      const matchPrograma = programa === 'todos' || item.programa === programa;
      const matchAnio = anio === 'todos' || item.anio === anio;
      const haystack = `${item.titulo} ${item.autores.join(' ')} ${stripHtml(item.resumen)}`.toLowerCase();
      return matchPrograma && matchAnio && (!term || haystack.includes(term));
    });
  });

  limpiar(): void {
    this.programa.set('todos');
    this.anio.set('todos');
    this.busqueda.set('');
  }

  onSearch(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }
}
