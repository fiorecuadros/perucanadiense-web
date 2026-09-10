import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { ArchivosStore } from '../../../core/store/archivos.store';

/**
 * Vista previa de una imagen a partir de su referencia (ruta pública, URL http,
 * `/api/archivos/…` o `idb:…`). Si no hay referencia o la imagen no carga,
 * muestra un marcador neutro. Presentacional: no toca datos.
 *
 * El tamaño lo controla el contenedor con las variables CSS
 * `--miniatura-size` (ancho, por defecto 56px) y `--miniatura-ratio`
 * (proporción, por defecto 1). El recorte con la entrada `ajuste`.
 */
@Component({
  selector: 'app-miniatura-imagen',
  standalone: true,
  template: `
    @if (src() && !roto()) {
      <img
        [src]="src()"
        [alt]="alt() || 'Vista previa'"
        loading="lazy"
        [style.object-fit]="ajuste()"
        (error)="roto.set(true)"
      />
    } @else {
      <span class="miniatura-marcador" aria-hidden="true">
        <i class="fa" [class.fa-image]="referencia()" [class.fa-image-portrait]="!referencia()"></i>
      </span>
    }
  `,
  styles: `
    :host {
      display: block;
      width: var(--miniatura-size, 56px);
      aspect-ratio: var(--miniatura-ratio, 1);
      flex: none;
      border-radius: var(--miniatura-radio, 9px);
      overflow: hidden;
      background: var(--adm-muted-bg);
      border: 1px solid var(--adm-line);
    }

    img {
      width: 100%;
      height: 100%;
      display: block;
    }

    .miniatura-marcador {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--adm-ink-soft);
      font-size: 0.9rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniaturaImagen {
  private readonly archivos = inject(ArchivosStore);

  readonly referencia = input('');
  readonly alt = input('');
  readonly ajuste = input<'cover' | 'contain'>('cover');

  readonly src = signal('');
  readonly roto = signal(false);

  constructor() {
    effect((onCleanup) => {
      const ref = this.referencia().trim();
      this.roto.set(false);
      if (!ref) {
        this.src.set('');
        return;
      }
      let vigente = true;
      onCleanup(() => {
        vigente = false;
      });
      void this.archivos
        .resolver(ref)
        .then((url) => {
          if (vigente) this.src.set(url);
        })
        .catch(() => {
          if (vigente) this.src.set('');
        });
    });
  }
}
