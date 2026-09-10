import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { NewsService } from '../../core/services/news.service';
import { AppSrc } from '../../core/directives/app-src';
import { BadgeComponent } from '../../shared/ui';
import { cuerpoHtml, excerpt } from '../../core/utils/html';
import type { NewsItem } from '../../core/models/news.model';

@Component({
  selector: 'app-noticia-detalle',
  standalone: true,
  imports: [RouterLink, BadgeComponent, AppSrc],
  templateUrl: './noticia-detalle.html',
  styleUrl: './noticia-detalle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticiaDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly news = inject(NewsService);

  readonly id = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  readonly item = computed(() => this.news.getById(this.id()));
  readonly related = computed(() => this.news.related(this.id(), 3));
  readonly viewerOpen = signal(false);

  readonly shareUrl = computed(() => {
    const id = this.id();
    if (typeof window === 'undefined' || !id) {
      return '';
    }
    return `${window.location.origin}/noticias/${id}`;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id && !this.news.getById(id)) {
        void this.router.navigate(['/no-encontrado'], { queryParams: { recurso: id } });
      }
    });
  }

  formatFecha(iso: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${iso}T00:00:00`));
  }

  cuerpo(noticia: NewsItem): string {
    return cuerpoHtml(noticia.paragraphs);
  }

  bajada(texto: string): string {
    return excerpt(texto, 160);
  }

  facebookUrl(url: string): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  }

  xUrl(url: string, title: string): string {
    return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  }

  whatsappUrl(url: string, title: string): string {
    return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  }
}
