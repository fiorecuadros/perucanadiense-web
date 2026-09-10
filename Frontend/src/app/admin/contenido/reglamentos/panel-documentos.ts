import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDropList, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import type { ReglamentoItem } from '../../../core/constants/reglamentos.constant';
import { CampoSeleccion } from '../../shared/campo-seleccion/campo-seleccion';
import { CampoTexto } from '../../shared/campo-texto/campo-texto';
import { RUTAS_PORTAL, type OpcionPortal } from '../../shared/opciones-portal';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';
import { TarjetaOrden } from '../../shared/tarjeta-orden/tarjeta-orden';

const CATEGORIAS: OpcionPortal[] = [
  { value: 'reglamento', label: 'Reglamento institucional' },
  { value: 'directivas', label: 'Directivas académicas' },
  { value: 'etica', label: 'Ética' },
  { value: 'manuales', label: 'Manuales' },
];

const ESTADOS: OpcionPortal[] = [
  { value: 'enlace', label: 'Publicado (lleva a una página)' },
  { value: 'sin-publicar', label: 'Sin publicar' },
];

@Component({
  selector: 'app-reglamentos-panel-documentos',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CampoSeleccion, CampoTexto, SeccionBloque, TarjetaOrden],
  template: `
    <app-seccion-bloque
      titulo="Lista de reglamentos y documentos"
      sub="Cada tarjeta es un documento normativo. Arrastre desde el asa para cambiar el orden."
      [cuenta]="items().length"
      cuentaSufijo="documentos"
    >
      @if (items().length) {
        <div class="rejilla" cdkDropList (cdkDropListDropped)="soltar($event)">
          @for (item of items(); track $index) {
            <app-tarjeta-orden
              cdkDrag
              etiquetaEliminar="Eliminar documento"
              (eliminar)="pedirEliminar.emit($index)"
            >
              <app-campo-texto
                label="Título del documento"
                placeholder="ejemplo: Reglamento interno e institucional"
                [valor]="item.titulo"
                (valorChange)="editar($index, 'titulo', $event)"
              />
              <app-campo-texto
                label="Descripción"
                placeholder="Qué contiene (una o dos frases)"
                [valor]="item.descripcion"
                (valorChange)="editar($index, 'descripcion', $event)"
              />
              <app-campo-seleccion
                label="Categoría"
                [opciones]="categorias"
                [valor]="item.categoria"
                (valorChange)="editar($index, 'categoria', $event)"
              />
              <app-campo-seleccion
                label="¿Está publicado?"
                [opciones]="estados"
                [valor]="item.estado"
                (valorChange)="editar($index, 'estado', $event)"
              />
              <app-campo-seleccion
                label="Página a la que lleva"
                [opciones]="rutas"
                [valor]="item.ruta ?? ''"
                (valorChange)="editar($index, 'ruta', $event)"
              />
            </app-tarjeta-orden>
          }
        </div>
      } @else {
        <p class="vacio">Todavía no hay documentos.</p>
      }

      <button type="button" class="btn-agregar" (click)="agregar()">
        <i class="fa fa-plus" aria-hidden="true"></i> Agregar documento
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
export class ReglamentosPanelDocumentos {
  readonly items = input.required<ReglamentoItem[]>();

  readonly itemsChange = output<ReglamentoItem[]>();
  readonly pedirEliminar = output<number>();

  readonly categorias = CATEGORIAS;
  readonly estados = ESTADOS;
  readonly rutas = RUTAS_PORTAL;

  editar(index: number, campo: keyof ReglamentoItem, valor: string): void {
    const next = this.items().map((it, i) => (i === index ? { ...it, [campo]: valor } : it));
    this.itemsChange.emit(next as ReglamentoItem[]);
  }

  agregar(): void {
    this.itemsChange.emit([
      ...this.items(),
      {
        id: `doc-${Date.now().toString(36)}`,
        titulo: '',
        descripcion: '',
        categoria: 'reglamento',
        estado: 'sin-publicar',
        ruta: '',
      },
    ]);
  }

  soltar(evento: CdkDragDrop<ReglamentoItem[]>): void {
    const next = [...this.items()];
    moveItemInArray(next, evento.previousIndex, evento.currentIndex);
    this.itemsChange.emit(next);
  }
}
