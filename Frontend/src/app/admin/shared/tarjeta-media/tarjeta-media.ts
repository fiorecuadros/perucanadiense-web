import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { MiniaturaImagen } from '../miniatura-imagen/miniatura-imagen';
import { SelectorArchivo } from '../selector-archivo/selector-archivo';

type Aspecto = 'pano' | 'foto' | 'logo';

/**
 * Tarjeta visual para editar un elemento con imagen (portada, servicio, logo).
 * Muestra la foto real, oculta la ruta del archivo y ofrece acciones claras:
 * arrastrar para reordenar, cambiar imagen y eliminar. Los campos de texto van
 * en el contenido proyectado.
 */
@Component({
  selector: 'app-tarjeta-media',
  standalone: true,
  imports: [CdkDragHandle, MiniaturaImagen, SelectorArchivo],
  template: `
    <div class="tm-media" [attr.data-aspecto]="aspecto()">
      <app-miniatura-imagen
        [referencia]="referencia()"
        [alt]="alt()"
        [ajuste]="aspecto() === 'logo' ? 'contain' : 'cover'"
      />
      <button
        type="button"
        class="tm-arrastre"
        cdkDragHandle
        aria-label="Arrastrar para reordenar"
        title="Arrastrar para reordenar"
      >
        <i class="fa fa-grip-vertical" aria-hidden="true"></i>
      </button>
    </div>

    <div class="tm-barra">
      <app-selector-archivo
        modo="imagen"
        variante="boton"
        [textoBoton]="referencia() ? 'Cambiar imagen' : 'Subir imagen'"
        (referenciaChange)="referenciaChange.emit($event)"
      />
      <button type="button" class="tm-eliminar" (click)="eliminar.emit()">
        <i class="fa fa-trash-can" aria-hidden="true"></i>
        <span>Eliminar</span>
      </button>
    </div>

    <div class="tm-cuerpo">
      @if (rotulo()) {
        <p class="tm-rotulo">{{ rotulo() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      background: var(--adm-surface);
      border: 1px solid var(--adm-line);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(50, 63, 124, 0.06);
      transition:
        box-shadow 0.16s ease,
        border-color 0.16s ease;
    }

    :host(:hover) {
      box-shadow: 0 10px 26px rgba(50, 63, 124, 0.12);
      border-color: color-mix(in srgb, var(--adm-brand) 32%, var(--adm-line));
    }

    :host(.cdk-drag-preview) {
      box-shadow: 0 18px 44px rgba(20, 19, 30, 0.28);
    }

    :host(.cdk-drag-placeholder) {
      opacity: 0.4;
    }

    .tm-media {
      position: relative;
      background: var(--adm-muted-bg);
      border-bottom: 1px solid var(--adm-line);
    }

    .tm-media app-miniatura-imagen {
      --miniatura-size: 100%;
      --miniatura-radio: 0;
      display: block;
      border: 0;
    }

    .tm-media[data-aspecto='pano'] app-miniatura-imagen {
      --miniatura-ratio: 16 / 9;
    }

    .tm-media[data-aspecto='foto'] app-miniatura-imagen {
      --miniatura-ratio: 4 / 3;
    }

    .tm-media[data-aspecto='logo'] {
      background: #fff;
      padding: 14px 18px;
    }

    .tm-media[data-aspecto='logo'] app-miniatura-imagen {
      --miniatura-ratio: 5 / 2;
      background: #fff;
    }

    .tm-arrastre {
      position: absolute;
      top: 8px;
      left: 8px;
      width: 30px;
      height: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 8px;
      background: rgba(20, 19, 30, 0.55);
      color: #fff;
      font-size: 0.82rem;
      cursor: grab;
      opacity: 0;
      transition: opacity 0.15s ease;
      backdrop-filter: blur(2px);
    }

    .tm-media[data-aspecto='logo'] .tm-arrastre {
      background: rgba(20, 19, 30, 0.35);
    }

    :host(:hover) .tm-arrastre,
    .tm-arrastre:focus-visible {
      opacity: 1;
    }

    .tm-arrastre:active {
      cursor: grabbing;
    }

    .tm-barra {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 10px 12px;
      background: var(--adm-bg);
      border-bottom: 1px solid var(--adm-line);
    }

    .tm-eliminar {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 34px;
      padding: 6px 12px;
      border: 1px solid var(--adm-line);
      border-radius: 8px;
      background: var(--adm-surface);
      color: var(--adm-danger);
      font: inherit;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .tm-eliminar:hover {
      background: var(--adm-danger-bg);
    }

    .tm-eliminar:focus-visible,
    .tm-arrastre:focus-visible {
      outline: 2px solid var(--adm-brand);
      outline-offset: 2px;
    }

    .tm-cuerpo {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px 15px 16px;
    }

    .tm-rotulo {
      margin: 0;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--adm-ink-soft);
    }

    @media (hover: none) {
      .tm-arrastre {
        opacity: 1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host,
      .tm-arrastre {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaMedia {
  readonly referencia = input('');
  readonly alt = input('');
  readonly aspecto = input<Aspecto>('pano');
  readonly rotulo = input('');

  readonly referenciaChange = output<string>();
  readonly eliminar = output<void>();
}
