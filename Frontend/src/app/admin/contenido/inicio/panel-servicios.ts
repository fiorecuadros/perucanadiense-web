import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDropList, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import type { InicioService } from '../../../core/constants/inicio.constant';
import { CampoTexto } from '../../shared/campo-texto/campo-texto';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';
import { TarjetaMedia } from '../../shared/tarjeta-media/tarjeta-media';

@Component({
  selector: 'app-inicio-panel-servicios',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CampoTexto, SeccionBloque, TarjetaMedia],
  template: `
    <app-seccion-bloque
      titulo="Otros servicios que se muestran en el inicio"
      sub="Bloques con foto y texto. Arrastre desde el asa para cambiar el orden."
      [cuenta]="items().length"
      cuentaSufijo="servicios"
    >
      @if (items().length) {
        <div class="rejilla" cdkDropList (cdkDropListDropped)="soltar($event)">
          @for (item of items(); track $index) {
            <app-tarjeta-media
              cdkDrag
              aspecto="foto"
              [referencia]="item.src"
              [alt]="item.alt"
              (referenciaChange)="editar($index, 'src', $event)"
              (eliminar)="pedirEliminar.emit($index)"
            >
              <app-campo-texto
                label="Nombre del servicio"
                placeholder="ejemplo: Carreras Técnicas"
                [valor]="item.title"
                (valorChange)="editar($index, 'title', $event)"
              />
              <app-campo-texto
                label="Descripción breve"
                hint="También se usa como descripción para lector de pantalla."
                [valor]="item.alt"
                (valorChange)="editar($index, 'alt', $event)"
              />
            </app-tarjeta-media>
          }
        </div>
      } @else {
        <p class="vacio">Todavía no hay servicios en esta sección.</p>
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
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    .cdk-drop-list-dragging app-tarjeta-media:not(.cdk-drag-placeholder) {
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
export class InicioPanelServicios {
  readonly items = input.required<InicioService[]>();

  readonly itemsChange = output<InicioService[]>();
  readonly pedirEliminar = output<number>();

  editar(index: number, campo: keyof InicioService, valor: string): void {
    const next = this.items().map((it, i) => (i === index ? { ...it, [campo]: valor } : it));
    this.itemsChange.emit(next);
  }

  agregar(): void {
    this.itemsChange.emit([...this.items(), { src: '', title: '', alt: '' }]);
  }

  soltar(evento: CdkDragDrop<InicioService[]>): void {
    const next = [...this.items()];
    moveItemInArray(next, evento.previousIndex, evento.currentIndex);
    this.itemsChange.emit(next);
  }
}
