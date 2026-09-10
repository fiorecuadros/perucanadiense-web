import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import type { PuedeSalirConCambios } from '../../shared/aviso-cambios/salir-con-cambios';
import { ModuloEditor } from '../../shared/modulo-editor/modulo-editor';
import { ADMISION_SCHEMA, ADMISION_TABS } from './admision.schema';

@Component({
  selector: 'app-admin-admision',
  standalone: true,
  imports: [ModuloEditor],
  template: `
    <app-modulo-editor
      #editor
      modulo="admision"
      titulo="Admisión"
      publicPath="/admision"
      [schema]="schema"
      [tabs]="tabs"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAdmision implements PuedeSalirConCambios {
  private readonly editor = viewChild<ModuloEditor>('editor');
  readonly schema = ADMISION_SCHEMA;
  readonly tabs = ADMISION_TABS;

  dirty(): boolean {
    return this.editor()?.dirty() ?? false;
  }

  confirmarSalida(): Promise<boolean> {
    return this.editor()?.confirmarSalida() ?? Promise.resolve(true);
  }
}
