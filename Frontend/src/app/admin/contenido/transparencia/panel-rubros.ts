import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDropList, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import type { PteRubro } from '../../../core/constants/transparencia.constant';
import { CampoSeleccion } from '../../shared/campo-seleccion/campo-seleccion';
import { CampoTexto } from '../../shared/campo-texto/campo-texto';
import { ICONOS_PORTAL, RUTAS_PORTAL, type OpcionPortal } from '../../shared/opciones-portal';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';
import { TarjetaOrden } from '../../shared/tarjeta-orden/tarjeta-orden';

const ESTADOS: OpcionPortal[] = [
  { value: 'publicado', label: 'Publicado (la página tiene documentos)' },
  { value: 'vacio', label: 'Sin documentos publicados' },
];

@Component({
  selector: 'app-transparencia-panel-rubros',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CampoSeleccion, CampoTexto, SeccionBloque, TarjetaOrden],
  template: `
    <app-seccion-bloque
      titulo="Rubros del Portal de Transparencia"
      sub="Cada tarjeta es un rubro del PTI. Escriba el título y la descripción, elija el ícono y la
        página, y marque si ya tiene documentos. Arrastre desde el asa para cambiar el orden."
      [cuenta]="items().length"
      cuentaSufijo="rubros"
    >
      @if (items().length) {
        <div class="rejilla" cdkDropList (cdkDropListDropped)="soltar($event)">
          @for (item of items(); track $index) {
            <app-tarjeta-orden
              cdkDrag
              etiquetaEliminar="Eliminar rubro"
              (eliminar)="pedirEliminar.emit($index)"
            >
              <app-campo-texto
                label="Título del rubro"
                placeholder="ejemplo: Derechos y tasas"
                [valor]="item.titulo"
                (valorChange)="editar($index, 'titulo', $event)"
              />
              <app-campo-texto
                label="Descripción"
                placeholder="Qué contiene este rubro (una o dos frases)"
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
                label="Página del rubro"
                [opciones]="rutas"
                [valor]="item.ruta"
                (valorChange)="editar($index, 'ruta', $event)"
              />
              <app-campo-seleccion
                label="¿Ya tiene documentos publicados?"
                [opciones]="estados"
                [valor]="item.estado"
                (valorChange)="editar($index, 'estado', $event)"
              />
            </app-tarjeta-orden>
          }
        </div>
      } @else {
        <p class="vacio">Todavía no hay rubros.</p>
      }

      <button type="button" class="btn-agregar" (click)="agregar()">
        <i class="fa fa-plus" aria-hidden="true"></i> Agregar rubro
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
export class TransparenciaPanelRubros {
  readonly items = input.required<PteRubro[]>();

  readonly itemsChange = output<PteRubro[]>();
  readonly pedirEliminar = output<number>();

  readonly iconos = ICONOS_PORTAL;
  readonly rutas = RUTAS_PORTAL;
  readonly estados = ESTADOS;

  editar(index: number, campo: keyof PteRubro, valor: string): void {
    const next = this.items().map((it, i) => (i === index ? { ...it, [campo]: valor } : it));
    this.itemsChange.emit(next as PteRubro[]);
  }

  agregar(): void {
    const id = `rubro-${Date.now().toString(36)}`;
    this.itemsChange.emit([
      ...this.items(),
      {
        id,
        titulo: '',
        descripcion: '',
        icon: 'fa-landmark',
        ruta: '/transparencia',
        estado: 'vacio',
      },
    ]);
  }

  soltar(evento: CdkDragDrop<PteRubro[]>): void {
    const next = [...this.items()];
    moveItemInArray(next, evento.previousIndex, evento.currentIndex);
    this.itemsChange.emit(next);
  }
}
