import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../api/portal.api';
import { NEWS_ITEMS } from '../constants/news.constant';
import { NewsCategory, NewsItem } from '../models/news.model';
import { persisted, type PersistedStore } from '../store/persisted-store';
import { stripHtml } from '../utils/html';

const KEY = 'pc-noticias';

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  noticia: 'Noticia',
  comunicado: 'Comunicado',
  evento: 'Actividad',
};

function slug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base || 'noticia'}-${Date.now().toString(36)}`;
}

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly api = inject(PortalApi);
  private readonly store: PersistedStore<NewsItem[]> = persisted(
    KEY,
    structuredClone(NEWS_ITEMS) as NewsItem[],
  );
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly all = this.store.value;
  readonly modificado = this.store.modificado;
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  /** Destacada de noticias/actividades (no comunicados). */
  readonly featured = computed(() => {
    const list = this.all().filter(
      (item) => item.publicada !== false && item.category !== 'comunicado',
    );
    return list.find((item) => item.featured) ?? list[0] ?? null;
  });

  /** Destacado de comunicados para Inicio. */
  readonly featuredComunicado = computed(() => {
    const list = this.all().filter(
      (item) => item.publicada !== false && item.category === 'comunicado',
    );
    return list.find((item) => item.featured) ?? list[0] ?? null;
  });

  async hidratar(): Promise<void> {
    if (!environment.useRemoteApi) return;
    this.loadingState.set(true);
    this.errorState.set(null);
    try {
      this.store.set(await this.api.noticias());
    } catch {
      this.errorState.set('No se pudieron cargar las noticias.');
    } finally {
      this.loadingState.set(false);
    }
  }

  /** El panel necesita también los borradores; el GET público los oculta. */
  async hidratarAdmin(): Promise<void> {
    if (!environment.useRemoteApi) return;
    this.loadingState.set(true);
    this.errorState.set(null);
    try {
      this.store.set(await this.api.noticiasAdmin());
    } catch {
      this.errorState.set('No se pudieron cargar las noticias.');
    } finally {
      this.loadingState.set(false);
    }
  }

  list(): readonly NewsItem[] {
    return this.all();
  }

  getById(id: string): NewsItem | undefined {
    return this.all().find((item) => item.id === id);
  }

  related(id: string, limit = 3): NewsItem[] {
    return this.all()
      .filter((item) => item.id !== id && item.publicada !== false)
      .slice(0, limit);
  }

  search(query: string): NewsItem[] {
    const needle = query.trim().toLowerCase();
    const origen = this.all().filter((item) => item.publicada !== false);
    if (!needle) {
      return [...origen];
    }
    return origen.filter((item) => {
      const haystack = [item.title, stripHtml(item.excerpt), item.categoryLabel, ...item.paragraphs]
        .map((parte) => stripHtml(parte).toLowerCase())
        .join(' ');
      return haystack.includes(needle);
    });
  }

  async crear(data: Omit<NewsItem, 'id'> & { id?: string }): Promise<NewsItem> {
    let created: NewsItem = {
      ...data,
      id: data.id ?? slug(data.title),
      categoryLabel: data.categoryLabel || NEWS_CATEGORY_LABEL[data.category],
    };
    if (environment.useRemoteApi) {
      created = await this.api.crearNoticia(created);
    }
    this.store.set(this.conDestacada(created, [...this.all(), created]));
    return created;
  }

  async actualizar(item: NewsItem): Promise<void> {
    const next = {
      ...item,
      categoryLabel: item.categoryLabel || NEWS_CATEGORY_LABEL[item.category],
    };
    if (environment.useRemoteApi) {
      await this.api.actualizarNoticia(next);
    }
    this.store.set(
      this.conDestacada(
        next,
        this.all().map((current) => (current.id === next.id ? next : current)),
      ),
    );
  }

  async eliminar(id: string): Promise<void> {
    if (environment.useRemoteApi) {
      await this.api.eliminarNoticia(id);
    }
    this.store.set(this.all().filter((item) => item.id !== id));
  }

  reset(): void {
    this.store.reset();
  }

  private conDestacada(item: NewsItem, list: NewsItem[]): NewsItem[] {
    if (!item.featured) return list;
    const esComunicado = item.category === 'comunicado';
    return list.map((current) => {
      if (current.id === item.id) return item;
      const mismoGrupo = esComunicado
        ? current.category === 'comunicado'
        : current.category !== 'comunicado';
      return mismoGrupo ? { ...current, featured: false } : current;
    });
  }
}
