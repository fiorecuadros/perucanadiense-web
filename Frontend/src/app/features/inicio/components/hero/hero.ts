import { AppSrc } from '../../../../core/directives/app-src';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../../../core/services/institution.service';
import { ContenidoStore } from '../../../../core/store/contenido.store';

@Component({
  selector: 'app-inicio-hero',
  standalone: true,
  imports: [AppSrc, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly institution = inject(InstitutionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contenido = inject(ContenidoStore);

  readonly info = this.institution.info;
  readonly copy = this.contenido.inicio.value;
  readonly heroImages = computed(() => this.copy().heroImages);

  readonly currentHeroIndex = signal(0);

  private heroInterval: ReturnType<typeof setInterval> | null = null;
  private accessibilityObserver: MutationObserver | null = null;

  constructor() {
    afterNextRender(() => {
      this.observeAccessibility();
      this.updateSlideshowState();
    });

    this.destroyRef.onDestroy(() => {
      this.stopHeroSlideshow();
      this.accessibilityObserver?.disconnect();
    });
  }

  private observeAccessibility(): void {
    if (typeof document === 'undefined') return;

    this.accessibilityObserver = new MutationObserver(() => {
      this.updateSlideshowState();
    });

    this.accessibilityObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    this.accessibilityObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private updateSlideshowState(): void {
    if (typeof document === 'undefined') return;

    const detenido =
      document.body.classList.contains('ae-stop-animation') ||
      document.documentElement.classList.contains('ae-stop-animation');

    if (detenido) {
      this.stopHeroSlideshow();
      console.log('Hero detenido por accesibilidad');
    } else {
      this.startHeroSlideshow();
    }
  }

  private startHeroSlideshow(): void {
    if (typeof window === 'undefined') return;

    const detenido =
      document.body.classList.contains('ae-stop-animation') ||
      document.documentElement.classList.contains('ae-stop-animation');

    if (
      detenido ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      this.stopHeroSlideshow();
      return;
    }

    this.stopHeroSlideshow();

    if (this.heroImages().length <= 1) return;

    this.heroInterval = setInterval(() => {
      const total = this.heroImages().length;

      if (total > 1) {
        this.currentHeroIndex.update((index) => (index + 1) % total);
      }
    }, 3500);
  }

  private stopHeroSlideshow(): void {
    if (this.heroInterval !== null) {
      clearInterval(this.heroInterval);
      this.heroInterval = null;
    }
  }
}
