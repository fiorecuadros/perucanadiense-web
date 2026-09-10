import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsService } from '../../core/services/news.service';
import { InstitutionService } from '../../core/services/institution.service';
import { AppSrc } from '../../core/directives/app-src';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { BadgeComponent } from '../../shared/ui';
import { excerpt } from '../../core/utils/html';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [RouterLink, PageHero, BadgeComponent, AppSrc],
  templateUrl: './noticias.html',
  styleUrl: './noticias.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Noticias {
  private readonly news = inject(NewsService);
  private readonly institution = inject(InstitutionService);

  readonly info = this.institution.info;
  readonly loading = this.news.loading;
  readonly error = this.news.error;
  readonly query = signal('');
  readonly currentPage = signal(1);

  readonly all = this.news.all;
  readonly newsEmpty = computed(() => this.all().length === 0);
  readonly destacada = computed(() => (this.query().trim() ? null : this.news.featured()));

  readonly filtradas = computed(() => {
    const results = this.news.search(this.query());
    const featured = this.destacada();
    return featured ? results.filter((item) => item.id !== featured.id) : results;
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtradas().length / PAGE_SIZE)));

  readonly paginadas = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * PAGE_SIZE;
    return this.filtradas().slice(start, start + PAGE_SIZE);
  });

  readonly pages = computed(() => this.buildPages(this.currentPage(), this.totalPages()));

  onSearch(value: string): void {
    this.query.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number | string): void {
    if (typeof page !== 'number') {
      return;
    }
    const next = Math.min(this.totalPages(), Math.max(1, page));
    this.currentPage.set(next);
  }

  formatFecha(iso: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${iso}T00:00:00`));
  }

  bajada(texto: string): string {
    return excerpt(texto, 220);
  }

  private buildPages(current: number, total: number): Array<number | '…'> {
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }
    const marks = new Set([1, total, current, current - 1, current + 1]);
    const sorted = [...marks].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
    const result: Array<number | '…'> = [];
    for (let i = 0; i < sorted.length; i += 1) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push('…');
      }
      result.push(sorted[i]);
    }
    return result;
  }
}
