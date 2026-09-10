import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDropList, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { CampoTexto } from '../campo-texto/campo-texto';
import { SeccionBloque } from '../seccion-bloque/seccion-bloque';
import { TarjetaOrden } from '../tarjeta-orden/tarjeta-orden';

type Fila = string | { id?: string };

/**
 * Lista reordenable de elementos con un solo campo de texto (categorías,
 * etiquetas de pestañas, …). El `id` se autogenera y no se muestra.
 */
@Component({
  selector: 'app-panel-etiquetas',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CampoTexto, SeccionBloque, TarjetaOrden],
  template: `
    <app-seccion-bloque
      [titulo]="titulo()"
      [sub]="sub()"
      [cuenta]="items().length"
      [cuentaSufijo]="sufijo()"
    >
      @if (items().length) {
        <div class="lista" cdkDropList (cdkDropListDropped)="soltar($event)">
          @for (item of items(); track $index) {
            <app-tarjeta-orden
              cdkDrag
              [etiquetaEliminar]="'Eliminar ' + singular()"
              (eliminar)="pedirEliminar.emit($index)"
            >
              <app-campo-texto
                [label]="campoLabel()"
                [placeholder]="campoPlaceholder()"
                [valor]="texto(item)"
                (valorChange)="editar($index, $event)"
              />
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

    .lista {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 640px;
    }

    .cdk-drop-list-dragging app-tarjeta-orden:not(.cdk-drag-placeholder) {
      transition: transform 0.18s cubic-bezier(0, 0, 0.2, 1);
    }

    .vacio {
      margin: 0;
      padding: 20px;
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
export class PanelEtiquetas {
  readonly items = input.required<readonly Fila[]>();
  /**
   * Propiedad de texto que se edita (p. ej. "nombre" o "label"). Si es "" los
   * elementos son cadenas de texto planas.
   */
  readonly campo = input('');
  readonly titulo = input('Elementos');
  readonly sub = input('');
  readonly sufijo = input('elementos');
  readonly singular = input('elemento');
  readonly campoLabel = input('Nombre');
  readonly campoPlaceholder = input('');

  readonly itemsChange = output<Fila[]>();
  readonly pedirEliminar = output<number>();

  texto(item: Fila): string {
    if (typeof item === 'string') return item;
    const v = (item as Record<string, unknown>)[this.campo()];
    return v === undefined || v === null ? '' : String(v);
  }

  editar(index: number, valor: string): void {
    const next = this.items().map((it, i) => {
      if (i !== index) return it;
      return typeof it === 'string' ? valor : { ...it, [this.campo()]: valor };
    });
    this.itemsChange.emit(next);
  }

  agregar(): void {
    const nuevo: Fila = this.campo()
      ? { id: `x-${Date.now().toString(36)}`, [this.campo()]: '' }
      : '';
    this.itemsChange.emit([...this.items(), nuevo]);
  }

  soltar(evento: CdkDragDrop<Fila[]>): void {
    const next = [...this.items()];
    moveItemInArray(next, evento.previousIndex, evento.currentIndex);
    this.itemsChange.emit(next);
  }
}
