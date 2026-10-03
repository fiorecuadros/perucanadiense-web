import { AppSrc } from '../../core/directives/app-src';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ButtonDirective } from '../../shared/ui';
import type { DocumentoInstitucional } from '../models/documento.model';
import { ArchivosStore } from './archivos.store';

@Component({
  selector: 'app-lista-docs',
  standalone: true,
  imports: [AppSrc, ButtonDirective],
  template: `
    @if (ficheros().length) {
      <div class="cta-row">
        @for (doc of ficheros(); track doc.id) {
          <a appButton [href]="href(doc)" target="_blank" rel="noopener noreferrer">
            {{ doc.titulo }}
          </a>
        }
      </div>
    }
    @for (doc of imagenes(); track doc.id) {
      @if (variante() === 'afiche') {
        <button type="button" class="poster" (click)="abrir(doc)">
          <img [appSrc]="doc.url" [alt]="doc.titulo" />
          <span>Ver afiche completo</span>
        </button>
      } @else {
        <figure class="cover">
          <img [appSrc]="doc.url" [alt]="doc.titulo" />
        </figure>
      }
    }
  `,
  host: {
    '[class.es-afiche]': 'variante() === "afiche"',
  },
  styles: `
    :host {
      display: block;
    }
    .cta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 4px 0 16px;
    }
    .cta-row a {
      text-decoration: none;
    }
    .cover {
      margin: 8px 0 0;
      max-width: 360px;
    }
    .cover img {
      display: block;
      width: 100%;
      height: auto;
      background: var(--inst-surface);
      box-shadow: 0 8px 24px rgba(43, 41, 61, 0.12);
    }
    .poster {
      all: unset;
      box-sizing: border-box;
      display: grid;
      gap: 12px;
      width: 100%;
      cursor: pointer;
    }
    .poster img {
      display: block;
      width: 100%;
      max-height: min(85vh, 980px);
      height: auto;
      object-fit: contain;
      background: #1c1b28;
      border-radius: 4px;
    }
    .poster span {
      justify-self: start;
      color: #fff;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .poster:focus-visible {
      outline: 3px solid var(--inst-primary);
      outline-offset: 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaDocs {
  private readonly archivos = inject(ArchivosStore);

  readonly docs = input<DocumentoInstitucional[]>([]);
  readonly variante = input<'ficha' | 'afiche'>('ficha');
  readonly urls = signal<Record<string, string>>({});

  readonly ficheros = computed(() => this.docs().filter((d) => d.tipo !== 'imagen'));
  readonly imagenes = computed(() => this.docs().filter((d) => d.tipo === 'imagen'));

  constructor() {
    effect(() => {
      const list = this.docs();
      void this.resolver(list);
    });
  }

  href(doc: DocumentoInstitucional): string {
    return this.urls()[doc.id] || doc.url;
  }

  abrir(doc: DocumentoInstitucional): void {
    const href = this.href(doc);
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  }

  private async resolver(list: DocumentoInstitucional[]): Promise<void> {
    const next: Record<string, string> = {};
    await Promise.all(
      list.map(async (doc) => {
        next[doc.id] = await this.archivos.resolver(doc.url);
      }),
    );
    this.urls.set(next);
  }
}