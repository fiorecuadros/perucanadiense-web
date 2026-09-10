import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CampoRico } from '../../shared/campo-rico/campo-rico';
import { CampoTexto } from '../../shared/campo-texto/campo-texto';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';

@Component({
  selector: 'app-nosotros-panel-identidad',
  standalone: true,
  imports: [CampoRico, CampoTexto, SeccionBloque],
  template: `
    <app-seccion-bloque
      titulo="Encabezado de la página"
      sub="Es lo primero que se lee al entrar a la sección Nosotros de la web."
    >
      <div class="tarjeta">
        <app-campo-texto
          label="Título de portada"
          placeholder="ejemplo: Nosotros · Quiénes somos"
          [valor]="heroTitle()"
          (valorChange)="heroTitleChange.emit($event)"
        />
        <app-campo-rico
          label="Mensaje introductorio (bajada)"
          hint="Un párrafo corto que presenta al instituto debajo del título."
          [valor]="heroLead()"
          (valorChange)="heroLeadChange.emit($event)"
        />
      </div>
    </app-seccion-bloque>
  `,
  styles: `
    :host {
      display: block;
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
export class NosotrosPanelIdentidad {
  readonly heroTitle = input.required<string>();
  readonly heroLead = input.required<string>();

  readonly heroTitleChange = output<string>();
  readonly heroLeadChange = output<string>();
}
