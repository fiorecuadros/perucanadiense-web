import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorEsquemaMarco } from '../../shared/editor-modulo/editor-esquema-marco';
import { HORARIOS_SCHEMA, HORARIOS_TABS } from './horarios.schema';

@Component({
  selector: 'app-admin-horarios',
  standalone: true,
  imports: [EditorEsquemaMarco],
  template: `
    <app-editor-esquema-marco
      [editor]="this"
      modulo="horarios"
      titulo="Horarios"
      sub="Los cambios guardados se actualizarán directamente en la sección Horarios de la web."
      publicPath="/horarios"
      [tabs]="tabs"
      [schema]="schema"
      [(activa)]="activa"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHorarios extends EditorModuloBase<'horarios'> {
  protected readonly moduloId = 'horarios' as const;
  readonly schema = HORARIOS_SCHEMA;
  readonly tabs = HORARIOS_TABS;
  readonly activa = signal(HORARIOS_TABS[0].id);
}
