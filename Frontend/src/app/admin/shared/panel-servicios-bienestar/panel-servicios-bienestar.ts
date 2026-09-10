import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDropList, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import type { BienestarServicio } from '../../../core/constants/bienestar.constant';
import { CampoSeleccion } from '../campo-seleccion/campo-seleccion';
import { CampoTexto } from '../campo-texto/campo-texto';
import { ICONOS_PORTAL } from '../opciones-portal';
import { SeccionBloque } from '../seccion-bloque/seccion-bloque';
import { TarjetaOrden } from '../tarjeta-orden/tarjeta-orden';

/**
 * Editor de tarjetas de servicio de bienestar (psicopedagógico, servicio
 * social, soporte médico). Cada servicio: nombre, descripción, ícono y —
 * opcionalmente— requisitos (uno por línea).
 */
@Component({
  selector: 'app-panel-servicios-bienestar',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CampoSeleccion, CampoTexto, SeccionBloque, TarjetaOrden],
  template: `
    <app-seccion-bloque
      titulo="Servicios que se ofrecen"
      sub="Cada tarjeta aparece en la página. Arrastre desde el asa para cambiar el orden."
      [cuenta]="items().length"
      cuentaSufijo="servicios"
    >
      @if (items().length) {
        <div class="rejilla" cdkDropList (cdkDropListDropped)="soltar($event)">
          @for (item of items(); track $index) {
            <app-tarjeta-orden
              cdkDrag
              etiquetaEliminar="Eliminar servicio"
              (eliminar)="pedirEliminar.emit($index)"
            >
              <app-campo-texto
                label="Nombre del servicio"
                placeholder="ejemplo: Orientación psicopedagógica"
                [valor]="item.titulo"
                (valorChange)="editar($index, 'titulo', $event)"
              />
              <app-campo-texto
                label="Descripción breve"
                placeholder="Una frase sobre qué ofrece"
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
              @if (conRequisitos()) {
                <app-campo-texto
                  label="Requisitos"
                  [multilinea]="true"
                  hint="Uno por línea. Se muestran como lista en la web."
                  placeholder="Constancia de matrícula&#10;Informe socioeconómico"
                  [valor]="item.requisitos ?? ''"
                  (valorChange)="editar($index, 'requisitos', $event)"
                />
              }
            </app-tarjeta-orden>
          }
        </div>
      } @else {
        <p class="vacio">Todavía no hay servicios.</p>
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
export class PanelServiciosBienestar {
  readonly items = input.required<BienestarServicio[]>();
  readonly conRequisitos = input(false);

  readonly itemsChange = output<BienestarServicio[]>();
  readonly pedirEliminar = output<number>();

  readonly iconos = ICONOS_PORTAL;

  editar(index: number, campo: keyof BienestarServicio, valor: string): void {
    const next = this.items().map((it, i) => (i === index ? { ...it, [campo]: valor } : it));
    this.itemsChange.emit(next);
  }

  agregar(): void {
    const base: BienestarServicio = { titulo: '', descripcion: '', icon: 'fa-heart' };
    this.itemsChange.emit([
      ...this.items(),
      this.conRequisitos() ? { ...base, requisitos: '' } : base,
    ]);
  }

  soltar(evento: CdkDragDrop<BienestarServicio[]>): void {
    const next = [...this.items()];
    moveItemInArray(next, evento.previousIndex, evento.currentIndex);
    this.itemsChange.emit(next);
  }
}
