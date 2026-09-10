import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MiniaturaImagen } from '../miniatura-imagen/miniatura-imagen';
import { esColumnaImagen, type ColumnaFila } from '../editor-contenido/schema';

@Component({
  selector: 'app-campo-lista',
  standalone: true,
  imports: [MiniaturaImagen],
  template: `
    <div class="fila-editor">
      @if (modo() === 'lista') {
        @if (strings().length) {
          <ol class="fila-lista">
            @for (item of strings(); track $index) {
              <li class="fila">
                <span class="fila-num">{{ $index + 1 }}</span>
                <input
                  class="fila-suelto"
                  type="text"
                  [value]="item"
                  [attr.aria-label]="'Elemento ' + ($index + 1)"
                  (input)="setString($index, $any($event.target).value)"
                />
                <div class="fila-acciones">
                  <button
                    type="button"
                    class="fila-mover"
                    [disabled]="$first"
                    (click)="mover($index, -1)"
                    aria-label="Subir"
                  >
                    <i class="fa fa-arrow-up" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="fila-mover"
                    [disabled]="$last"
                    (click)="mover($index, 1)"
                    aria-label="Bajar"
                  >
                    <i class="fa fa-arrow-down" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="fila-quitar"
                    (click)="quitar($index)"
                    aria-label="Quitar"
                  >
                    <i class="fa fa-trash-can" aria-hidden="true"></i>
                  </button>
                </div>
              </li>
            }
          </ol>
        } @else {
          <p class="fila-vacio">Aún no hay elementos. Añada el primero abajo.</p>
        }
        <button type="button" class="fila-add" (click)="addString()">
          <i class="fa fa-plus" aria-hidden="true"></i> Añadir elemento
        </button>
      } @else {
        @if (filas().length) {
          <ol class="fila-lista">
            @for (row of filas(); track $index) {
              <li class="fila fila--tarjeta">
                <span class="fila-num">{{ $index + 1 }}</span>
                <div class="fila-campos">
                  @for (col of columnasEfectivas(); track col.key) {
                    <div class="fila-campo" [class.fila-campo--ancho]="esImagen(col)">
                      @if (esImagen(col)) {
                        <app-miniatura-imagen
                          [referencia]="celda(row, col.key)"
                          [alt]="col.label"
                        />
                      }
                      <label class="fila-campo-cuerpo">
                        <span class="fila-campo-label">{{ col.label }}</span>
                        @if (col.tipo === 'opciones') {
                          <select
                            [value]="celda(row, col.key)"
                            (change)="setCelda($index, col, $event)"
                          >
                            @for (opt of col.opciones ?? []; track opt.value) {
                              <option [value]="opt.value">{{ opt.label }}</option>
                            }
                          </select>
                        } @else {
                          <input
                            [type]="col.tipo === 'numero' ? 'number' : 'text'"
                            [placeholder]="col.label"
                            [value]="celda(row, col.key)"
                            (input)="setCelda($index, col, $event)"
                          />
                        }
                      </label>
                    </div>
                  }
                </div>
                <div class="fila-acciones">
                  <button
                    type="button"
                    class="fila-mover"
                    [disabled]="$first"
                    (click)="mover($index, -1)"
                    aria-label="Subir fila"
                  >
                    <i class="fa fa-arrow-up" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="fila-mover"
                    [disabled]="$last"
                    (click)="mover($index, 1)"
                    aria-label="Bajar fila"
                  >
                    <i class="fa fa-arrow-down" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="fila-quitar"
                    (click)="quitar($index)"
                    aria-label="Quitar fila"
                  >
                    <i class="fa fa-trash-can" aria-hidden="true"></i>
                  </button>
                </div>
              </li>
            }
          </ol>
        } @else {
          <p class="fila-vacio">Aún no hay filas. Añada la primera abajo.</p>
        }
        <button type="button" class="fila-add" (click)="addFila()">
          <i class="fa fa-plus" aria-hidden="true"></i> Añadir fila
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .fila-editor {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .fila-lista {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      counter-reset: fila;
    }

    .fila {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border: 1px solid var(--adm-line);
      border-radius: 11px;
      background: var(--adm-surface);
      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;
    }

    .fila:hover {
      border-color: color-mix(in srgb, var(--adm-brand) 45%, var(--adm-line));
      box-shadow: 0 4px 16px rgba(50, 63, 124, 0.08);
    }

    .fila:focus-within {
      border-color: var(--adm-brand);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--adm-brand) 18%, transparent);
    }

    .fila--tarjeta {
      align-items: start;
    }

    .fila-num {
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: var(--adm-muted-bg);
      color: var(--adm-ink-soft);
      font-size: 0.78rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .fila--tarjeta .fila-num {
      margin-top: 2px;
    }

    .fila-campos {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 14px;
      min-width: 0;
    }

    .fila-campo {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      min-width: 0;
      flex: 1 1 240px;
    }

    .fila-campo--ancho {
      flex-basis: 100%;
    }

    .fila-campo-cuerpo {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .fila-campo-label {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--adm-ink-soft);
    }

    .fila input,
    .fila select {
      width: 100%;
      min-width: 0;
      min-height: 38px;
      padding: 8px 11px;
      border: 1px solid var(--adm-line);
      border-radius: 8px;
      background: var(--adm-bg);
      color: var(--adm-ink);
      font: inherit;
      font-size: 0.88rem;
      transition:
        border-color 0.15s ease,
        background 0.15s ease;
    }

    .fila input:hover,
    .fila select:hover {
      border-color: color-mix(in srgb, var(--adm-ink) 22%, var(--adm-line));
    }

    .fila input:focus,
    .fila select:focus {
      outline: none;
      border-color: var(--adm-brand);
      background: var(--adm-surface);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--adm-brand) 16%, transparent);
    }

    .fila-suelto {
      align-self: center;
    }

    .fila-acciones {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .fila--tarjeta .fila-acciones {
      margin-top: 20px;
    }

    .fila-mover,
    .fila-quitar {
      width: 30px;
      height: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid transparent;
      border-radius: 7px;
      background: transparent;
      color: var(--adm-ink-soft);
      font-size: 0.78rem;
      cursor: pointer;
      transition:
        background 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease;
    }

    .fila-mover:hover:not(:disabled) {
      background: var(--adm-muted-bg);
      color: var(--adm-ink);
    }

    .fila-mover:disabled {
      opacity: 0.32;
      cursor: not-allowed;
    }

    .fila-quitar:hover {
      background: var(--adm-danger-bg);
      color: var(--adm-danger);
      border-color: color-mix(in srgb, var(--adm-danger) 30%, transparent);
    }

    .fila-mover:focus-visible,
    .fila-quitar:focus-visible,
    .fila-add:focus-visible {
      outline: 2px solid var(--adm-brand);
      outline-offset: 2px;
    }

    .fila-vacio {
      margin: 0;
      padding: 14px 12px;
      border: 1px dashed var(--adm-line);
      border-radius: 10px;
      background: var(--adm-bg);
      color: var(--adm-ink-soft);
      font-size: 0.83rem;
      text-align: center;
    }

    .fila-add {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 38px;
      padding: 8px 16px;
      border: 1px solid var(--adm-line);
      border-radius: 9px;
      background: var(--adm-surface);
      color: var(--adm-brand);
      font: inherit;
      font-size: 0.83rem;
      font-weight: 600;
      cursor: pointer;
      transition:
        background 0.15s ease,
        border-color 0.15s ease;
    }

    .fila-add:hover {
      background: color-mix(in srgb, var(--adm-brand) 8%, var(--adm-surface));
      border-color: color-mix(in srgb, var(--adm-brand) 45%, var(--adm-line));
    }

    .fila-add i {
      font-size: 0.72rem;
    }

    @media (max-width: 620px) {
      .fila {
        grid-template-columns: auto 1fr;
      }

      .fila-campos {
        grid-template-columns: 1fr;
      }

      .fila-acciones {
        grid-column: 2;
        justify-content: flex-end;
      }

      .fila--tarjeta .fila-acciones {
        margin-top: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .fila,
      .fila input,
      .fila select,
      .fila-mover,
      .fila-quitar,
      .fila-add {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoLista {
  readonly modo = input<'lista' | 'filas'>('lista');
  readonly items = input<unknown>([]);
  readonly columnas = input<ColumnaFila[] | undefined>(undefined);
  readonly itemsChange = output<unknown>();

  columnasEfectivas(): ColumnaFila[] {
    return (
      this.columnas() ?? [
        { key: 'label', label: 'Criterio', tipo: 'texto' },
        { key: 'score', label: 'Puntaje', tipo: 'numero' },
      ]
    );
  }

  esImagen(col: ColumnaFila): boolean {
    return esColumnaImagen(col);
  }

  strings(): string[] {
    const v = this.items();
    return Array.isArray(v) ? v.map((item) => String(item ?? '')) : [];
  }

  filas(): Record<string, unknown>[] {
    const v = this.items();
    return Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
  }

  celda(row: Record<string, unknown>, key: string): string {
    const val = row[key];
    return val === undefined || val === null ? '' : String(val);
  }

  setString(index: number, value: string): void {
    const next = [...this.strings()];
    next[index] = value;
    this.itemsChange.emit(next);
  }

  addString(): void {
    this.itemsChange.emit([...this.strings(), '']);
  }

  addFila(): void {
    const row: Record<string, unknown> = {};
    for (const col of this.columnasEfectivas()) {
      if (col.tipo === 'numero') {
        row[col.key] = 0;
      } else if (col.tipo === 'opciones') {
        row[col.key] = col.opciones?.[0]?.value ?? '';
      } else {
        row[col.key] = '';
      }
    }
    this.itemsChange.emit([...this.filas(), row]);
  }

  setCelda(index: number, col: ColumnaFila, event: Event): void {
    const el = event.target as HTMLInputElement | HTMLSelectElement;
    const next = this.filas().map((row) => ({ ...row }));
    const numerico = col.tipo === 'numero' && 'valueAsNumber' in el;
    next[index] = {
      ...next[index],
      [col.key]: numerico ? (el as HTMLInputElement).valueAsNumber || 0 : el.value,
    };
    this.itemsChange.emit(next);
  }

  quitar(index: number): void {
    if (this.modo() === 'lista') {
      this.itemsChange.emit(this.strings().filter((_, i) => i !== index));
    } else {
      this.itemsChange.emit(this.filas().filter((_, i) => i !== index));
    }
  }

  mover(index: number, dir: -1 | 1): void {
    const list = this.modo() === 'lista' ? [...this.strings()] : [...this.filas()];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item as never);
    this.itemsChange.emit(list);
  }
}
