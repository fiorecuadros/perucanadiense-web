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
  imports: [RouterLink],
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

  constructor() {
    afterNextRender(() => this.startHeroSlideshow());
    this.destroyRef.onDestroy(() => this.stopHeroSlideshow());
  }

  private startHeroSlideshow(): void {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    this.stopHeroSlideshow();
    this.heroInterval = setInterval(() => {
      this.currentHeroIndex.update((index) => (index + 1) % this.heroImages().length);
    }, 3500);
  }

  private stopHeroSlideshow(): void {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
      this.heroInterval = null;
    }
  }
}
