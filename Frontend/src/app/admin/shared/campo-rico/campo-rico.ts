import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EditorQuill } from '../editor-quill/editor-quill';

/**
 * Editor de texto con formato, con etiqueta y ayuda opcional. Envuelve al
 * editor enriquecido con un contenedor limpio. Presentacional y controlado.
 */
@Component({
  selector: 'app-campo-rico',
  standalone: true,
  imports: [EditorQuill],
  template: `
    <span class="cr-label">{{ label() }}</span>
    @if (hint()) {
      <span class="cr-hint">
        @if (info()) {
          <i class="fa fa-circle-info" aria-hidden="true"></i>
        }
        {{ hint() }}
      </span>
    }
    <app-editor-quill
      [html]="valor()"
      [placeholder]="placeholder()"
      [compacto]="compacto()"
      (htmlChange)="valorChange.emit($event)"
    />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .cr-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--adm-ink);
    }

    .cr-hint {
      display: inline-flex;
      align-items: baseline;
      gap: 5px;
      margin-bottom: 3px;
      font-size: 0.73rem;
      color: var(--adm-ink-soft);
      line-height: 1.45;
    }

    .cr-hint .fa {
      font-size: 0.72rem;
      color: var(--adm-ink-soft);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoRico {
  readonly label = input('');
  readonly valor = input('');
  readonly hint = input('');
  readonly info = input(false);
  readonly placeholder = input('Escriba aquí…');
  readonly compacto = input(false);

  readonly valorChange = output<string>();
}
