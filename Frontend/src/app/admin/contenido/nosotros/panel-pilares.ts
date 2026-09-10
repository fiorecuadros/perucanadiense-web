import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CampoImagen } from '../../shared/campo-imagen/campo-imagen';
import { CampoRico } from '../../shared/campo-rico/campo-rico';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';

@Component({
  selector: 'app-nosotros-panel-pilares',
  standalone: true,
  imports: [CampoImagen, CampoRico, SeccionBloque],
  template: `
    <app-seccion-bloque
      titulo="Misión"
      sub="El propósito que guía al instituto. Se muestra en la sección Nosotros de la web."
    >
      <div class="tarjeta">
        <app-campo-rico
          label="Texto de la misión"
          [valor]="mission()"
          (valorChange)="missionChange.emit($event)"
        />
      </div>
    </app-seccion-bloque>

    <app-seccion-bloque titulo="Visión" sub="A dónde quiere llegar el instituto.">
      <div class="tarjeta">
        <app-campo-rico
          label="Texto de la visión"
          hint="Texto oficial al 2029, salvo que el instituto lo actualice."
          [info]="true"
          [valor]="vision()"
          (valorChange)="visionChange.emit($event)"
        />
      </div>
    </app-seccion-bloque>

    <app-seccion-bloque
      titulo="Valores institucionales"
      sub="Se muestran en la sección Nosotros de la web. Use la lista con viñetas, un valor por línea."
    >
      <div class="tarjeta">
        <app-campo-rico
          label="Texto de los valores"
          [valor]="valuesText()"
          (valorChange)="valuesTextChange.emit($event)"
        />
      </div>
    </app-seccion-bloque>

    <app-seccion-bloque
      titulo="Organigrama"
      sub="Imagen con la estructura organizativa del instituto."
    >
      <app-campo-imagen
        [referencia]="organigramaSrc()"
        [alt]="organigramaAlt()"
        etiquetaAlt="Descripción del organigrama (accesibilidad)"
        textoQuitar="Quitar organigrama"
        (referenciaChange)="organigramaSrcChange.emit($event)"
        (altChange)="organigramaAltChange.emit($event)"
        (pedirQuitar)="pedirQuitarOrganigrama.emit()"
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
      padding: 18px;
      border: 1px solid var(--adm-line);
      border-radius: 14px;
      background: var(--adm-surface);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NosotrosPanelPilares {
  readonly mission = input.required<string>();
  readonly vision = input.required<string>();
  readonly valuesText = input.required<string>();
  readonly organigramaSrc = input.required<string>();
  readonly organigramaAlt = input.required<string>();

  readonly missionChange = output<string>();
  readonly visionChange = output<string>();
  readonly valuesTextChange = output<string>();
  readonly organigramaSrcChange = output<string>();
  readonly organigramaAltChange = output<string>();
  readonly pedirQuitarOrganigrama = output<void>();
}
