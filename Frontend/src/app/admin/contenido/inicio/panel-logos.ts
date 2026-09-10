import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDropList, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import type { InicioLogo } from '../../../core/constants/inicio.constant';
import { CampoTexto } from '../../shared/campo-texto/campo-texto';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';
import { TarjetaMedia } from '../../shared/tarjeta-media/tarjeta-media';

@Component({
  selector: 'app-inicio-panel-logos',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CampoTexto, SeccionBloque, TarjetaMedia],
  template: `
    <app-seccion-bloque
      titulo="Instituciones aliadas"
      sub="Sus logos aparecen al pie del inicio. Arrastre desde el asa para cambiar el orden."
      [cuenta]="items().length"
      cuentaSufijo="instituciones"
    >
      @if (items().length) {
        <div class="rejilla" cdkDropList (cdkDropListDropped)="soltar($event)">
          @for (item of items(); track $index) {
            <app-tarjeta-media
              cdkDrag
              aspecto="logo"
              [referencia]="item.image"
              [alt]="item.alt"
              (referenciaChange)="editar($index, 'image', $event)"
              (eliminar)="pedirEliminar.emit($index)"
            >
              <app-campo-texto
                label="Nombre de la entidad"
                placeholder="ejemplo: Ministerio de Educación"
                [valor]="item.alt"
                (valorChange)="editar($index, 'alt', $event)"
              />
              <app-campo-texto
                label="Enlace web (a dónde lleva al hacer clic)"
                tipo="url"
                placeholder="ejemplo: https://www.gob.pe/minedu"
                [valor]="item.url"
                (valorChange)="editar($index, 'url', $event)"
              />
            </app-tarjeta-media>
          }
        </div>
      } @else {
        <p class="vacio">Todavía no hay instituciones aliadas.</p>
      }

      <button type="button" class="btn-agregar" (click)="agregar()">
        <i class="fa fa-plus" aria-hidden="true"></i> Agregar institución
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
export class InicioPanelLogos {
  readonly items = input.required<InicioLogo[]>();

  readonly itemsChange = output<InicioLogo[]>();
  readonly pedirEliminar = output<number>();

  editar(index: number, campo: keyof InicioLogo, valor: string): void {
    const next = this.items().map((it, i) => (i === index ? { ...it, [campo]: valor } : it));
    this.itemsChange.emit(next);
  }

  agregar(): void {
    this.itemsChange.emit([...this.items(), { image: '', url: '', alt: '' }]);
  }

  soltar(evento: CdkDragDrop<InicioLogo[]>): void {
    const next = [...this.items()];
    moveItemInArray(next, evento.previousIndex, evento.currentIndex);
    this.itemsChange.emit(next);
  }
}
