import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDropList, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { CampoSeleccion } from '../campo-seleccion/campo-seleccion';
import { CampoTexto } from '../campo-texto/campo-texto';
import type { OpcionPortal } from '../opciones-portal';
import { SeccionBloque } from '../seccion-bloque/seccion-bloque';
import { TarjetaOrden } from '../tarjeta-orden/tarjeta-orden';

export interface CampoTarjeta {
  key: string;
  label: string;
  tipo: 'texto' | 'multilinea' | 'seleccion';
  placeholder?: string;
  hint?: string;
  opciones?: OpcionPortal[];
  iconoPreview?: boolean;
}

type Fila = Record<string, unknown>;

/**
 * Lista reordenable de tarjetas con campos configurables (texto, área o menú).
 * Evita repetir un panel a medida por cada lista del CMS.
 */
@Component({
  selector: 'app-panel-tarjetas',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CampoSeleccion, CampoTexto, SeccionBloque, TarjetaOrden],
  template: `
    <app-seccion-bloque
      [titulo]="titulo()"
      [sub]="sub()"
      [cuenta]="items().length"
      [cuentaSufijo]="sufijo()"
    >
      @if (items().length) {
        <div class="rejilla" cdkDropList (cdkDropListDropped)="soltar($event)">
          @for (item of items(); track $index) {
            <app-tarjeta-orden
              cdkDrag
              [etiquetaEliminar]="'Eliminar ' + singular()"
              (eliminar)="pedirEliminar.emit($index)"
            >
              @for (campo of campos(); track campo.key) {
                @switch (campo.tipo) {
                  @case ('seleccion') {
                    <app-campo-seleccion
                      [label]="campo.label"
                      [hint]="campo.hint ?? ''"
                      [opciones]="campo.opciones ?? []"
                      [iconoPreview]="!!campo.iconoPreview"
                      [valor]="texto(item, campo.key)"
                      (valorChange)="editar($index, campo.key, $event)"
                    />
                  }
                  @case ('multilinea') {
                    <app-campo-texto
                      [label]="campo.label"
                      [multilinea]="true"
                      [hint]="campo.hint ?? ''"
                      [placeholder]="campo.placeholder ?? ''"
                      [valor]="texto(item, campo.key)"
                      (valorChange)="editar($index, campo.key, $event)"
                    />
                  }
                  @default {
                    <app-campo-texto
                      [label]="campo.label"
                      [hint]="campo.hint ?? ''"
                      [placeholder]="campo.placeholder ?? ''"
                      [valor]="texto(item, campo.key)"
                      (valorChange)="editar($index, campo.key, $event)"
                    />
                  }
                }
              }
            </app-tarjeta-orden>
          }
        </div>
      } @else {
        <p class="vacio">Todavía no hay {{ sufijo() }}.</p>
      }

      <button type="button" class="btn-agregar" (click)="agregar()">
        <i class="fa fa-plus" aria-hidden="true"></i> Agregar {{ singular() }}
      </button>
    </app-seccion-bloque>
  `,
  styles: `
    :host {
      display: block;
    }

    .rejilla {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .cdk-drop-list-dragging app-tarjeta-orden:not(.cdk-drag-placeholder) {
      transition: transform 0.18s cubic-bezier(0, 0, 0.2, 1);
    }

    .vacio {
      margin: 0;
      padding: 22px;
      border: 1px dashed var(--adm-line);
      border-radius: 12px;
      background: var(--adm-bg);
      color: var(--adm-ink-soft);
      font-size: 0.85rem;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelTarjetas {
  readonly items = input.required<Fila[]>();
  readonly campos = input.required<CampoTarjeta[]>();
  readonly titulo = input('Elementos');
  readonly sub = input('');
  readonly sufijo = input('elementos');
  readonly singular = input('elemento');
  /** Valores por defecto de una tarjeta nueva. */
  readonly nuevo = input<Fila>({});
  /** Si se indica, esa clave se renumera (1, 2, 3…) en cada cambio de orden. */
  readonly autonumerar = input<string>('');

  readonly itemsChange = output<Fila[]>();
  readonly pedirEliminar = output<number>();

  texto(item: Fila, key: string): string {
    const v = item[key];
    return v === undefined || v === null ? '' : String(v);
  }

  editar(index: number, key: string, valor: string): void {
    const next = this.items().map((it, i) => (i === index ? { ...it, [key]: valor } : it));
    this.itemsChange.emit(this.renumerar(next));
  }

  agregar(): void {
    this.itemsChange.emit(this.renumerar([...this.items(), { ...this.nuevo() }]));
  }

  soltar(evento: CdkDragDrop<Fila[]>): void {
    const next = [...this.items()];
    moveItemInArray(next, evento.previousIndex, evento.currentIndex);
    this.itemsChange.emit(this.renumerar(next));
  }

  private renumerar(lista: Fila[]): Fila[] {
    const clave = this.autonumerar();
    if (!clave) return lista;
    return lista.map((it, i) => ({ ...it, [clave]: i + 1 }));
  }
}
