import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppSrc } from '../../../../core/directives/app-src';
import { Reveal } from '../../../../core/directives/reveal';
import { NewsService } from '../../../../core/services/news.service';
import type { NewsItem } from '../../../../core/models/news.model';

/** Tope de piezas visibles en cada recuadro de Inicio. */
const MAX_PORTADA = 3;

/**
 * Destacada primero (si hay), el resto por fecha. Al publicar o cambiar el
 * destacado, esta lista es la que ve Inicio.
 */
function paraPortada(items: NewsItem[]): NewsItem[] {
  const ordenadas = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const destacada = ordenadas.find((item) => item.featured);
  if (!destacada) return ordenadas.slice(0, MAX_PORTADA);
  return [destacada, ...ordenadas.filter((item) => item.id !== destacada.id)].slice(0, MAX_PORTADA);
}

@Component({
  selector: 'app-inicio-actualidad',
  standalone: true,
  imports: [RouterLink, AppSrc, Reveal],
  templateUrl: './actualidad.html',
  styleUrl: './actualidad.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Actualidad {
  private readonly news = inject(NewsService);

  readonly loading = this.news.loading;
  readonly error = this.news.error;

  constructor() {
    void this.news.hidratar();
  }

  /** Publicadas, de la más reciente a la más antigua. */
  private readonly publicadas = computed(() =>
    this.news.all().filter((item) => item.publicada !== false),
  );

  private readonly noticiasPortada = computed(() =>
    paraPortada(this.publicadas().filter((item) => item.category !== 'comunicado')),
  );

  private readonly comunicadosPortada = computed(() =>
    paraPortada(this.publicadas().filter((item) => item.category === 'comunicado')),
  );

  readonly noticiaDestacada = computed<NewsItem | null>(() => this.noticiasPortada()[0] ?? null);
  readonly noticiasLista = computed(() => this.noticiasPortada().slice(1));

  readonly comunicadoDestacado = computed<NewsItem | null>(
    () => this.comunicadosPortada()[0] ?? null,
  );
  readonly comunicadosLista = computed(() => this.comunicadosPortada().slice(1));

  readonly sinNoticias = computed(() => this.noticiaDestacada() === null);
  readonly sinComunicados = computed(() => this.comunicadoDestacado() === null);

  reintentar(): void {
    void this.news.hidratar();
  }

  formatFecha(iso: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${iso}T00:00:00`));
  }
}
