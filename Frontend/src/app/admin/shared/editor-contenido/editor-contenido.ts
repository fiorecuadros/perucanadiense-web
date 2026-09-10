import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { getPath, setPath } from '../../../core/store/object-path';
import { CampoLista } from '../campo-lista/campo-lista';
import { EditorQuill } from '../editor-quill/editor-quill';
import { MiniaturaImagen } from '../miniatura-imagen/miniatura-imagen';
import { SelectorArchivo } from '../selector-archivo/selector-archivo';
import type { CampoSchema } from './schema';

@Component({
  selector: 'app-editor-contenido',
  standalone: true,
  imports: [CampoLista, EditorQuill, MiniaturaImagen, SelectorArchivo],
  template: `
    @for (campo of schema(); track campo.key) {
      <div
        class="form-row"
        [class.form-row--lista]="campo.tipo === 'filas' || campo.tipo === 'lista'"
      >
        <label [attr.for]="'campo-' + campo.key">{{ campo.label }}</label>
        @switch (campo.tipo) {
          @case ('area') {
            <app-editor-quill
              [html]="texto(campo.key)"
              (htmlChange)="setTexto(campo.key, $event)"
            />
          }
          @case ('numero') {
            <input
              class="campo-numero"
              [id]="'campo-' + campo.key"
              type="number"
              [value]="texto(campo.key)"
              (input)="setNumero(campo.key, $event)"
            />
          }
          @case ('url') {
            @if (campo.acepta === 'imagen') {
              <div class="campo-imagen">
                <app-miniatura-imagen
                  class="campo-imagen-preview"
                  [referencia]="texto(campo.key)"
                  [alt]="campo.label"
                />
                <div class="campo-imagen-controles">
                  <input
                    [id]="'campo-' + campo.key"
                    type="url"
                    placeholder="images/… o https://…"
                    [value]="texto(campo.key)"
                    (input)="setTexto(campo.key, $any($event.target).value)"
                  />
                  <app-selector-archivo
                    class="campo-selector"
                    [modo]="campo.acepta"
                    [referencia]="texto(campo.key)"
                    (referenciaChange)="setTexto(campo.key, $event)"
                  />
                </div>
              </div>
            } @else {
              <input
                [id]="'campo-' + campo.key"
                type="url"
                [value]="texto(campo.key)"
                (input)="setTexto(campo.key, $any($event.target).value)"
              />
              @if (campo.acepta) {
                <app-selector-archivo
                  class="campo-selector"
                  [modo]="campo.acepta"
                  [referencia]="texto(campo.key)"
                  (referenciaChange)="setTexto(campo.key, $event)"
                />
              }
            }
          }
          @case ('lista') {
            <app-campo-lista
              modo="lista"
              [items]="get(campo.key)"
              (itemsChange)="set(campo.key, $event)"
            />
          }
          @case ('filas') {
            <app-campo-lista
              modo="filas"
              [items]="get(campo.key)"
              [columnas]="campo.columnas"
              (itemsChange)="set(campo.key, $event)"
            />
          }
          @default {
            <input
              [id]="'campo-' + campo.key"
              type="text"
              [value]="texto(campo.key)"
              (input)="setTexto(campo.key, $any($event.target).value)"
            />
          }
        }
        @if (campo.hint) {
          <p class="form-hint">{{ campo.hint }}</p>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    :host > .form-row + .form-row {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid var(--adm-line);
    }

    .form-row--lista > label {
      margin-bottom: 2px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--adm-ink);
    }

    .campo-numero {
      max-width: 160px;
    }

    .campo-imagen {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .campo-imagen-preview {
      --miniatura-size: 92px;
      margin-top: 2px;
    }

    .campo-imagen-controles {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .campo-selector {
      display: block;
    }

    /* La zona de arrastre es secundaria frente al campo de texto. */
    .campo-imagen-controles ::ng-deep .dropzone {
      padding: 12px 14px;
    }

    .campo-imagen-controles ::ng-deep .dropzone i {
      font-size: 1rem;
    }

    @media (max-width: 620px) {
      .campo-imagen {
        flex-direction: column;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorContenido {
  readonly schema = input<CampoSchema[]>([]);
  readonly valor = input<unknown>({});
  readonly valorChange = output<unknown>();

  get(key: string): unknown {
    return getPath(this.valor(), key);
  }

  texto(key: string): string {
    const v = this.get(key);
    return v === undefined || v === null ? '' : String(v);
  }

  set(key: string, val: unknown): void {
    this.valorChange.emit(setPath(this.valor(), key, val));
  }

  setTexto(key: string, val: string): void {
    this.set(key, val);
  }

  setNumero(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.set(key, Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : 0);
  }
}
