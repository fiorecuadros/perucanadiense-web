import {
  Directive, DestroyRef, ElementRef, effect, inject, input
} from '@angular/core';
import { ArchivosStore } from '../store/archivos.store';

const FALLBACK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
  <rect width="960" height="640" fill="#f1f5f9"/>
  <circle cx="480" cy="280" r="70" fill="#e2e8f0"/>
  <g fill="none" stroke="#64748b" stroke-width="8" stroke-linejoin="round">
    <rect x="442" y="251" width="76" height="58" rx="8"/>
    <path d="m444 297 22-22 19 18 12-13 19 17"/>
    <circle cx="495" cy="266" r="5"/>
  </g>
  <text x="480" y="400" text-anchor="middle"
    font-family="Arial,sans-serif" font-size="25" fill="#475569">
    Imagen no disponible
  </text>
</svg>`);

@Directive({
  selector: 'img[appSrc]',
  standalone: true,
  host: {
    '(load)': 'onLoad()',
    '(error)': 'onError()',
  },
})
export class AppSrc {
  private readonly archivos = inject(ArchivosStore);
  private readonly el = inject(ElementRef<HTMLImageElement>);
  private readonly destroyRef = inject(DestroyRef);
  private request = 0;
  private destroyed = false;
  private fallback = false;

  readonly appSrc = input<string | null | undefined>('', {
    alias: 'appSrc',
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.request++;
    });

    effect(() => {
      const raw = (this.appSrc() ?? '').trim();
      const request = ++this.request;
      const img = this.el.nativeElement;

      this.fallback = false;
      img.style.visibility = 'hidden';
      img.removeAttribute('src');
      img.setAttribute('aria-busy', 'true');

      if (!raw) {
        this.onError();
        return;
      }

      void this.archivos.resolver(raw).then((url) => {
        if (this.destroyed || request !== this.request) return;

        if (!url) {
          this.onError();
          return;
        }

        img.src = url;

        if (img.complete && img.naturalWidth > 0) {
          this.onLoad();
        }
      }).catch(() => {
        if (!this.destroyed && request === this.request) {
          this.onError();
        }
      });
    });
  }

  onLoad(): void {
    const img = this.el.nativeElement;
    img.style.visibility = 'visible';
    img.setAttribute('aria-busy', 'false');
  }

  onError(): void {
    const img = this.el.nativeElement;
    img.setAttribute('aria-busy', 'false');
    img.style.visibility = 'hidden';

    if (this.fallback) return;

    this.fallback = true;
    img.src = FALLBACK;
  }
}