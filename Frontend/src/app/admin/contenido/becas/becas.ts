import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import type { PuedeSalirConCambios } from '../../shared/aviso-cambios/salir-con-cambios';
import { ModuloEditor } from '../../shared/modulo-editor/modulo-editor';
import { BECAS_SCHEMA, BECAS_TABS } from './becas.schema';

@Component({
  selector: 'app-admin-becas',
  standalone: true,
  imports: [ModuloEditor],
  template: `
    <app-modulo-editor
      #editor
      modulo="becas"
      titulo="Becas y créditos"
      publicPath="/becas"
      [schema]="schema"
      [tabs]="tabs"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBecas implements PuedeSalirConCambios {
  private readonly editor = viewChild<ModuloEditor>('editor');
  readonly schema = BECAS_SCHEMA;
  readonly tabs = BECAS_TABS;

  dirty(): boolean {
    return this.editor()?.dirty() ?? false;
  }

  confirmarSalida(): Promise<boolean> {
    return this.editor()?.confirmarSalida() ?? Promise.resolve(true);
  }
}
