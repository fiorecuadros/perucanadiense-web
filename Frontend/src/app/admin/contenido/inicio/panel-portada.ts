import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDropList, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import type { InicioHeroImage } from '../../../core/constants/inicio.constant';
import { CampoImagen } from '../../shared/campo-imagen/campo-imagen';
import { CampoTexto } from '../../shared/campo-texto/campo-texto';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';
import { TarjetaMedia } from '../../shared/tarjeta-media/tarjeta-media';

@Component({
  selector: 'app-inicio-panel-portada',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CampoImagen, CampoTexto, SeccionBloque, TarjetaMedia],
  template: `
    <app-seccion-bloque
      titulo="Imágenes del carrusel principal"
      sub="Se muestran en rotación al abrir el portal. Arrastre desde el asa para cambiar el orden."
      [cuenta]="imagenes().length"
      cuentaSufijo="imágenes"
    >
      @if (imagenes().length) {
        <div class="rejilla" cdkDropList (cdkDropListDropped)="soltar($event)">
          @for (img of imagenes(); track $index) {
            <app-tarjeta-media
              cdkDrag
              aspecto="pano"
              [referencia]="img.src"
              [alt]="img.alt"
              [rotulo]="'Imagen ' + ($index + 1)"
              (referenciaChange)="editar($index, 'src', $event)"
              (eliminar)="pedirEliminarImagen.emit($index)"
            >
              <app-campo-texto
                label="Descripción de la imagen"
                hint="Breve descripción para personas que usan lector de pantalla."
                [valor]="img.alt"
                (valorChange)="editar($index, 'alt', $event)"
              />
            </app-tarjeta-media>
          }
        </div>
      } @else {
        <p class="vacio">Todavía no hay imágenes en el carrusel.</p>
      }

      <button type="button" class="btn-agregar" (click)="agregarImagen()">
        <i class="fa fa-plus" aria-hidden="true"></i> Subir nueva imagen
      </button>
    </app-seccion-bloque>

    <app-seccion-bloque
      titulo="Imagen de licenciamiento"
      sub="Aparece en la ventana emergente del botón «Licenciamiento»."
    >
      <app-campo-imagen
        [referencia]="licencia().src"
        [alt]="licencia().alt"
        etiquetaAlt="Descripción de la imagen (accesibilidad)"
        textoQuitar="Quitar"
        (referenciaChange)="editarLicencia('src', $event)"
        (altChange)="editarLicencia('alt', $event)"
        (pedirQuitar)="pedirQuitarLicencia.emit()"
      />
    </app-seccion-bloque>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 26px;
    }

    .rejilla {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
export class InicioPanelPortada {
  readonly imagenes = input.required<InicioHeroImage[]>();
  readonly licencia = input.required<InicioHeroImage>();

  readonly imagenesChange = output<InicioHeroImage[]>();
  readonly licenciaChange = output<InicioHeroImage>();
  readonly pedirEliminarImagen = output<number>();
  readonly pedirQuitarLicencia = output<void>();

  editar(index: number, campo: keyof InicioHeroImage, valor: string): void {
    const next = this.imagenes().map((img, i) => (i === index ? { ...img, [campo]: valor } : img));
    this.imagenesChange.emit(next);
  }

  agregarImagen(): void {
    this.imagenesChange.emit([...this.imagenes(), { src: '', alt: '' }]);
  }

  soltar(evento: CdkDragDrop<InicioHeroImage[]>): void {
    const next = [...this.imagenes()];
    moveItemInArray(next, evento.previousIndex, evento.currentIndex);
    this.imagenesChange.emit(next);
  }

  editarLicencia(campo: keyof InicioHeroImage, valor: string): void {
    this.licenciaChange.emit({ ...this.licencia(), [campo]: valor });
  }
}
