import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CampoTexto } from '../campo-texto/campo-texto';
import { MiniaturaImagen } from '../miniatura-imagen/miniatura-imagen';
import { SelectorArchivo } from '../selector-archivo/selector-archivo';

/**
 * Campo de imagen con vista previa. Cuando hay imagen muestra una tarjeta con
 * miniatura, botones «Cambiar imagen» / «Quitar» y el campo de descripción de
 * accesibilidad. Cuando está vacío muestra la zona para arrastrar o examinar.
 * Nunca expone la ruta del archivo. Presentacional y controlado.
 */
@Component({
  selector: 'app-campo-imagen',
  standalone: true,
  imports: [CampoTexto, MiniaturaImagen, SelectorArchivo],
  template: `
    @if (referencia()) {
      <div class="ci-tarjeta">
        <app-miniatura-imagen class="ci-preview" [referencia]="referencia()" [alt]="alt()" />
        <div class="ci-cuerpo">
          <div class="ci-acciones">
            <app-selector-archivo
              modo="imagen"
              variante="boton"
              textoBoton="Cambiar imagen"
              (referenciaChange)="referenciaChange.emit($event)"
            />
            <button type="button" class="ci-quitar" (click)="pedirQuitar.emit()">
              <i class="fa fa-xmark" aria-hidden="true"></i> {{ textoQuitar() }}
            </button>
          </div>
          <app-campo-texto
            [label]="etiquetaAlt()"
            [hint]="hintAlt()"
            [valor]="alt()"
            (valorChange)="altChange.emit($event)"
          />
        </div>
      </div>
    } @else {
      <app-selector-archivo modo="imagen" (referenciaChange)="referenciaChange.emit($event)" />
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .ci-tarjeta {
      display: grid;
      grid-template-columns: minmax(180px, 240px) 1fr;
      gap: 18px;
      padding: 16px;
      border: 1px solid var(--adm-line);
      border-radius: 14px;
      background: var(--adm-surface);
    }

    .ci-preview {
      --miniatura-size: 100%;
      --miniatura-ratio: 4 / 3;
    }

    .ci-cuerpo {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
    }

    .ci-acciones {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .ci-quitar {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 34px;
      padding: 6px 13px;
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

    .ci-quitar:hover {
      background: var(--adm-danger-bg);
    }

    .ci-quitar:focus-visible {
      outline: 2px solid var(--adm-brand);
      outline-offset: 2px;
    }

    @media (max-width: 560px) {
      .ci-tarjeta {
        grid-template-columns: 1fr;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ci-quitar {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoImagen {
  readonly referencia = input('');
  readonly alt = input('');
  readonly etiquetaAlt = input('Descripción de la imagen (accesibilidad)');
  readonly hintAlt = input('Breve descripción para personas que usan lector de pantalla.');
  readonly textoQuitar = input('Quitar');

  readonly referenciaChange = output<string>();
  readonly altChange = output<string>();
  readonly pedirQuitar = output<void>();
}
