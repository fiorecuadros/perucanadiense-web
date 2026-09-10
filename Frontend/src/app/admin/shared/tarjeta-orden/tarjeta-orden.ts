import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';

/**
 * Tarjeta reordenable: asa de arrastre arriba a la izquierda, contenido
 * proyectado y botón de eliminar arriba a la derecha. El `cdkDrag` lo pone el
 * contenedor sobre `<app-tarjeta-orden>`.
 */
@Component({
  selector: 'app-tarjeta-orden',
  standalone: true,
  imports: [CdkDragHandle],
  template: `
    <header class="to-head">
      <button
        type="button"
        class="to-asa"
        cdkDragHandle
        aria-label="Arrastrar para reordenar"
        title="Arrastrar para reordenar"
      >
        <i class="fa fa-grip-vertical" aria-hidden="true"></i>
      </button>
      <ng-content select="[encabezado]" />
      <button
        type="button"
        class="to-eliminar"
        (click)="eliminar.emit()"
        [attr.aria-label]="etiquetaEliminar()"
      >
        <i class="fa fa-trash-can" aria-hidden="true"></i> Eliminar
      </button>
    </header>

    <div class="to-cuerpo">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px;
      background: var(--adm-surface);
      border: 1px solid var(--adm-line);
      border-radius: 14px;
      box-shadow: 0 1px 2px rgba(50, 63, 124, 0.06);
      transition:
        box-shadow 0.16s ease,
        border-color 0.16s ease;
    }

    :host(:hover) {
      box-shadow: 0 8px 22px rgba(50, 63, 124, 0.1);
      border-color: color-mix(in srgb, var(--adm-brand) 28%, var(--adm-line));
    }

    :host(.cdk-drag-preview) {
      box-shadow: 0 18px 44px rgba(20, 19, 30, 0.26);
    }

    :host(.cdk-drag-placeholder) {
      opacity: 0.4;
    }

    .to-head {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .to-asa {
      width: 30px;
      height: 30px;
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 8px;
      background: var(--adm-muted-bg);
      color: var(--adm-ink-soft);
      font-size: 0.8rem;
      cursor: grab;
    }

    .to-asa:active {
      cursor: grabbing;
    }

    .to-eliminar {
      margin-left: auto;
      flex: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 32px;
      padding: 5px 11px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      color: var(--adm-ink-soft);
      font: inherit;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition:
        background 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease;
    }

    .to-eliminar:hover {
      background: var(--adm-danger-bg);
      color: var(--adm-danger);
      border-color: color-mix(in srgb, var(--adm-danger) 30%, transparent);
    }

    .to-asa:focus-visible,
    .to-eliminar:focus-visible {
      outline: 2px solid var(--adm-brand);
      outline-offset: 2px;
    }

    .to-cuerpo {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaOrden {
  readonly etiquetaEliminar = input('Eliminar');
  readonly eliminar = output<void>();
}
