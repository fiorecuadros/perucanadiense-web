import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Campo de texto con etiqueta y ayuda opcional. Presentacional y controlado:
 * recibe `valor` y emite `valorChange` en cada tecla.
 */
@Component({
  selector: 'app-campo-texto',
  standalone: true,
  template: `
    <label class="ct">
      <span class="ct-label">{{ label() }}</span>
      @if (multilinea()) {
        <textarea
          rows="4"
          [value]="valor()"
          [placeholder]="placeholder()"
          (input)="valorChange.emit($any($event.target).value)"
        ></textarea>
      } @else {
        <input
          [type]="tipo()"
          [value]="valor()"
          [placeholder]="placeholder()"
          [attr.inputmode]="tipo() === 'url' ? 'url' : tipo() === 'number' ? 'decimal' : null"
          [attr.min]="tipo() === 'number' ? '0' : null"
          [attr.step]="tipo() === 'number' ? '0.01' : null"
          (input)="valorChange.emit($any($event.target).value)"
        />
      }
      @if (hint()) {
        <span class="ct-hint">{{ hint() }}</span>
      }
    </label>
  `,
  styles: `
    :host {
      display: block;
    }

    .ct {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .ct-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--adm-ink);
    }

    input,
    textarea {
      width: 100%;
      min-height: 40px;
      padding: 9px 12px;
      border: 1px solid var(--adm-line);
      border-radius: 9px;
      background: var(--adm-bg);
      color: var(--adm-ink);
      font: inherit;
      font-size: 0.9rem;
      transition:
        border-color 0.15s ease,
        background 0.15s ease,
        box-shadow 0.15s ease;
    }

    textarea {
      resize: vertical;
      line-height: 1.5;
    }

    input:hover,
    textarea:hover {
      border-color: color-mix(in srgb, var(--adm-ink) 20%, var(--adm-line));
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--adm-brand);
      background: var(--adm-surface);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--adm-brand) 16%, transparent);
    }

    .ct-hint {
      font-size: 0.73rem;
      color: var(--adm-ink-soft);
      line-height: 1.4;
    }

    @media (prefers-reduced-motion: reduce) {
      input,
      textarea {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoTexto {
  readonly label = input('');
  readonly valor = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly tipo = input<'text' | 'url' | 'number'>('text');
  readonly multilinea = input(false);

  readonly valorChange = output<string>();
}
