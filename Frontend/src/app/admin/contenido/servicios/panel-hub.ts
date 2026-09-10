import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDropList, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import type { ServicioHubItem } from '../../../core/constants/servicios.constant';
import { CampoSeleccion } from '../../shared/campo-seleccion/campo-seleccion';
import { CampoTexto } from '../../shared/campo-texto/campo-texto';
import { ICONOS_PORTAL, RUTAS_PORTAL } from '../../shared/opciones-portal';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';
import { TarjetaOrden } from '../../shared/tarjeta-orden/tarjeta-orden';

@Component({
  selector: 'app-servicios-panel-hub',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CampoSeleccion, CampoTexto, SeccionBloque, TarjetaOrden],
  template: `
    <app-seccion-bloque
      titulo="Tarjetas de servicios"
      sub="Cada tarjeta lleva a una página del portal. Arrastre desde el asa para cambiar el orden."
      [cuenta]="items().length"
      cuentaSufijo="tarjetas"
    >
      @if (items().length) {
        <div class="rejilla" cdkDropList (cdkDropListDropped)="soltar($event)">
          @for (item of items(); track $index) {
            <app-tarjeta-orden
              cdkDrag
              etiquetaEliminar="Eliminar tarjeta"
              (eliminar)="pedirEliminar.emit($index)"
            >
              <app-campo-texto
                label="Nombre del servicio"
                placeholder="ejemplo: Soporte médico"
                [valor]="item.titulo"
                (valorChange)="editar($index, 'titulo', $event)"
              />
              <app-campo-texto
                label="Descripción breve"
                placeholder="Una frase corta sobre qué ofrece este servicio"
                [valor]="item.descripcion"
                (valorChange)="editar($index, 'descripcion', $event)"
              />
              <app-campo-seleccion
                label="Ícono de la tarjeta"
                [opciones]="iconos"
                [iconoPreview]="true"
                [valor]="item.icon"
                (valorChange)="editar($index, 'icon', $event)"
              />
              <app-campo-seleccion
                label="Página a la que lleva"
                [opciones]="rutas"
                [valor]="item.ruta"
                (valorChange)="editar($index, 'ruta', $event)"
              />
            </app-tarjeta-orden>
          }
        </div>
      } @else {
        <p class="vacio">Todavía no hay tarjetas de servicios.</p>
      }

      <button type="button" class="btn-agregar" (click)="agregar()">
        <i class="fa fa-plus" aria-hidden="true"></i> Agregar servicio
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
export class ServiciosPanelHub {
  readonly items = input.required<ServicioHubItem[]>();

  readonly itemsChange = output<ServicioHubItem[]>();
  readonly pedirEliminar = output<number>();

  readonly iconos = ICONOS_PORTAL;
  readonly rutas = RUTAS_PORTAL;

  editar(index: number, campo: keyof ServicioHubItem, valor: string): void {
    const next = this.items().map((it, i) => (i === index ? { ...it, [campo]: valor } : it));
    this.itemsChange.emit(next);
  }

  agregar(): void {
    this.itemsChange.emit([
      ...this.items(),
      { titulo: '', descripcion: '', icon: 'fa-circle-info', ruta: '/psicopedagogico' },
    ]);
  }

  soltar(evento: CdkDragDrop<ServicioHubItem[]>): void {
    const next = [...this.items()];
    moveItemInArray(next, evento.previousIndex, evento.currentIndex);
    this.itemsChange.emit(next);
  }
}
