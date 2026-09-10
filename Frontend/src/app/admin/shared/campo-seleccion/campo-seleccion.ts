import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { conValorActual, type OpcionPortal } from '../opciones-portal';

/**
 * Campo de selección con etiqueta y ayuda opcional. Si el valor guardado no está
 * en las opciones, se añade como «(actual)» para no perderlo. Con `iconoPreview`
 * muestra el valor como ícono Font Awesome a la izquierda.
 */
@Component({
  selector: 'app-campo-seleccion',
  standalone: true,
  template: `
    <label class="cs">
      <span class="cs-label">{{ label() }}</span>
      <span class="cs-fila">
        @if (iconoPreview()) {
          <span class="cs-icono" aria-hidden="true">
            <i class="fa-solid {{ valor() || 'fa-circle-question' }}"></i>
          </span>
        }
        <select [value]="valor()" (change)="valorChange.emit($any($event.target).value)">
          @for (op of opcionesConActual(); track op.value) {
            <option [value]="op.value">{{ op.label }}</option>
          }
        </select>
      </span>
      @if (hint()) {
        <span class="cs-hint">{{ hint() }}</span>
      }
    </label>
  `,
  styles: `
    :host {
      display: block;
    }

    .cs {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .cs-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--adm-ink);
    }

    .cs-fila {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cs-icono {
      width: 38px;
      height: 38px;
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9px;
      background: color-mix(in srgb, var(--adm-brand) 12%, var(--adm-surface));
      color: var(--adm-brand);
      font-size: 1rem;
    }

    select {
      flex: 1;
      min-width: 0;
      min-height: 40px;
      padding: 8px 11px;
      border: 1px solid var(--adm-line);
      border-radius: 9px;
      background: var(--adm-bg);
      color: var(--adm-ink);
      font: inherit;
      font-size: 0.9rem;
    }

    select:focus {
      outline: none;
      border-color: var(--adm-brand);
      background: var(--adm-surface);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--adm-brand) 16%, transparent);
    }

    select:focus-visible {
      outline: 2px solid var(--adm-brand);
      outline-offset: 2px;
    }

    .cs-hint {
      font-size: 0.73rem;
      color: var(--adm-ink-soft);
      line-height: 1.4;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoSeleccion {
  readonly label = input('');
  readonly valor = input('');
  readonly hint = input('');
  readonly opciones = input.required<OpcionPortal[]>();
  readonly iconoPreview = input(false);

  readonly valorChange = output<string>();

  readonly opcionesConActual = computed(() => conValorActual(this.opciones(), this.valor()));
}
