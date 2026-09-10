import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CampoImagen } from '../../shared/campo-imagen/campo-imagen';
import { CampoRico } from '../../shared/campo-rico/campo-rico';
import { CampoTexto } from '../../shared/campo-texto/campo-texto';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';

@Component({
  selector: 'app-costos-panel-matricula',
  standalone: true,
  imports: [CampoImagen, CampoRico, CampoTexto, SeccionBloque],
  template: `
    <app-seccion-bloque
      titulo="Proceso de matrícula"
      sub="Lo que un estudiante necesita saber para matricularse."
    >
      <div class="tarjeta">
        <app-campo-rico
          label="Texto de matrícula"
          hint="Presentación del proceso y qué ciclos se convocan."
          [valor]="matriculaLead()"
          (valorChange)="matriculaLeadChange.emit($event)"
        />
        <app-campo-rico
          label="Pasos para pagar y matricularse"
          hint="Use la lista numerada: un paso por línea."
          [valor]="paymentStepsText()"
          (valorChange)="paymentStepsTextChange.emit($event)"
        />
        <app-campo-rico
          label="Nota de reincorporación"
          hint="Qué debe hacer quien se reincorpora."
          [valor]="reinstatementNote()"
          (valorChange)="reinstatementNoteChange.emit($event)"
        />
      </div>
    </app-seccion-bloque>

    <app-seccion-bloque titulo="Formato FUT" sub="El enlace al formato de ficha de matrícula.">
      <div class="tarjeta">
        <app-campo-texto
          label="Nombre del enlace"
          placeholder="ejemplo: FUT — ficha de matrícula"
          [valor]="futLabel()"
          (valorChange)="futLabelChange.emit($event)"
        />
        <app-campo-texto
          label="Enlace al formato FUT"
          tipo="url"
          placeholder="Pegue aquí el enlace del formato"
          hint="Se usa como respaldo si no se sube un documento en esta sección."
          [valor]="futUrl()"
          (valorChange)="futUrlChange.emit($event)"
        />
      </div>
    </app-seccion-bloque>

    <app-seccion-bloque
      titulo="Imagen de matrícula"
      sub="Foto que acompaña al proceso de matrícula en la web."
    >
      <app-campo-imagen
        [referencia]="imagenSrc()"
        [alt]="imagenAlt()"
        etiquetaAlt="Descripción de la imagen (accesibilidad)"
        (referenciaChange)="imagenSrcChange.emit($event)"
        (altChange)="imagenAltChange.emit($event)"
        (pedirQuitar)="pedirQuitarImagen.emit()"
      />
    </app-seccion-bloque>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 26px;
    }

    .tarjeta {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 18px;
      border: 1px solid var(--adm-line);
      border-radius: 14px;
      background: var(--adm-surface);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostosPanelMatricula {
  readonly matriculaLead = input.required<string>();
  readonly paymentStepsText = input.required<string>();
  readonly reinstatementNote = input.required<string>();
  readonly futLabel = input.required<string>();
  readonly futUrl = input.required<string>();
  readonly imagenSrc = input.required<string>();
  readonly imagenAlt = input.required<string>();

  readonly matriculaLeadChange = output<string>();
  readonly paymentStepsTextChange = output<string>();
  readonly reinstatementNoteChange = output<string>();
  readonly futLabelChange = output<string>();
  readonly futUrlChange = output<string>();
  readonly imagenSrcChange = output<string>();
  readonly imagenAltChange = output<string>();
  readonly pedirQuitarImagen = output<void>();
}
