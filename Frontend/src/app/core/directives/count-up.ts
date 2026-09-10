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
 * Anima un número desde 0 hasta su valor final la primera vez que entra en
 * viewport (o al cargar, si ya está a la vista). El contenido estático del
 * elemento cubre el primer pintado; el movimiento reducido salta al final.
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUp {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Valor final al que llega la cuenta. */
  readonly appCountUp = input.required<number>();
  /** Texto antepuesto al número, p. ej. "+". */
  readonly prefix = input('', { alias: 'appCountUpPrefix' });
  /** Duración de la animación en milisegundos. */
  readonly durationMs = input<number, unknown>(1400, {
    alias: 'appCountUpDuration',
    transform: (value: unknown) => numberAttribute(value, 1400),
  });
  /** Espera antes de empezar, para escalonar cifras vecinas. */
  readonly delayMs = input<number, unknown>(0, {
    alias: 'appCountUpDelay',
    transform: (value: unknown) => numberAttribute(value, 0),
  });

  private destroyed = false;
  private started = false;

  constructor() {
    this.destroyRef.onDestroy(() => (this.destroyed = true));
    afterNextRender(() => this.arm());
  }

  private write(value: number): void {
    const formatted = new Intl.NumberFormat('es-PE').format(Math.round(value));
    this.el.nativeElement.textContent = `${this.prefix()}${formatted}`;
  }

  private arm(): void {
    const target = this.appCountUp();
    const sinMovimiento =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (sinMovimiento || typeof IntersectionObserver === 'undefined') {
      this.write(target);
      return;
    }

    this.write(0);

    const node = this.el.nativeElement;
    const grupo = (node.closest('.stat-bar') as HTMLElement | null) ?? node;
    const rect = grupo.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;

    if (inView) {
      this.run(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        this.run(target);
      },
      { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
    );
    observer.observe(grupo);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private run(target: number): void {
    if (this.started) return;
    this.started = true;

    const duration = Math.max(400, this.durationMs());
    const delay = Math.max(0, this.delayMs());
    const origin = performance.now() + delay;

    const step = (now: number) => {
      if (this.destroyed) return;
      if (now < origin) {
        this.write(0);
        requestAnimationFrame(step);
        return;
      }
      const t = Math.min(1, (now - origin) / duration);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      this.write(target * eased);
      if (t < 1) requestAnimationFrame(step);
      else this.write(target);
    };
    requestAnimationFrame(step);
  }
}
