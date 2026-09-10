import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

/**
 * Revela el elemento con un desvanecido y subida sutil la primera vez que
 * entra en viewport. El estado oculto solo se aplica con scripting activo
 * (ver styles.css), así que sin JS el contenido se ve siempre.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: { class: 'app-reveal' },
})
export class Reveal {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Retardo en ms antes de revelar, para escalonar grupos de tarjetas. */
  readonly delayMs = input<number, unknown>(0, {
    alias: 'appRevealDelay',
    transform: (value: unknown) => numberAttribute(value, 0),
  });

  constructor() {
    afterNextRender(() => this.arm());
  }

  private arm(): void {
    const node = this.el.nativeElement;
    const revelar = () => node.classList.add('is-revealed');

    const sinMovimiento =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (sinMovimiento || typeof IntersectionObserver === 'undefined') {
      revelar();
      return;
    }

    if (this.delayMs() > 0) {
      node.style.setProperty('--reveal-delay', `${this.delayMs()}ms`);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        revelar();
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(node);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
