import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CampoImagen } from '../../shared/campo-imagen/campo-imagen';
import { CampoRico } from '../../shared/campo-rico/campo-rico';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';

@Component({
  selector: 'app-nosotros-panel-historia',
  standalone: true,
  imports: [CampoImagen, CampoRico, SeccionBloque],
  template: `
    <app-seccion-bloque
      titulo="Reseña histórica"
      sub="El texto de presentación de la historia del instituto."
    >
      <div class="tarjeta">
        <app-campo-rico
          label="Texto de la reseña"
          [valor]="historyLead()"
          (valorChange)="historyLeadChange.emit($event)"
        />
      </div>
    </app-seccion-bloque>

    <app-seccion-bloque
      titulo="Imagen de la historia"
      sub="Fotografía que acompaña a la reseña histórica."
    >
      <app-campo-imagen
        [referencia]="imagenSrc()"
        [alt]="imagenAlt()"
        etiquetaAlt="Descripción de la imagen (accesibilidad)"
        textoQuitar="Eliminar"
        (referenciaChange)="imagenSrcChange.emit($event)"
        (altChange)="imagenAltChange.emit($event)"
        (pedirQuitar)="pedirQuitarImagen.emit()"
      />
    </app-seccion-bloque>

    <app-seccion-bloque
      titulo="Cronología y detalle"
      sub="Los hechos año a año que se muestran al pulsar «Ver más» en la web. Use la lista con viñetas."
    >
      <div class="tarjeta">
        <app-campo-rico
          label="Texto de la cronología"
          [valor]="timeline()"
          (valorChange)="timelineChange.emit($event)"
        />
      </div>
    </app-seccion-bloque>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 26px;
    }

    .tarjeta {
      padding: 18px;
      border: 1px solid var(--adm-line);
      border-radius: 14px;
      background: var(--adm-surface);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NosotrosPanelHistoria {
  readonly historyLead = input.required<string>();
  readonly imagenSrc = input.required<string>();
  readonly imagenAlt = input.required<string>();
  readonly timeline = input.required<string>();

  readonly historyLeadChange = output<string>();
  readonly imagenSrcChange = output<string>();
  readonly imagenAltChange = output<string>();
  readonly timelineChange = output<string>();
  readonly pedirQuitarImagen = output<void>();
}
