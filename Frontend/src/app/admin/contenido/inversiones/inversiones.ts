import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorEsquemaMarco } from '../../shared/editor-modulo/editor-esquema-marco';
import { INVERSIONES_SCHEMA, INVERSIONES_TABS } from './inversiones.schema';

@Component({
  selector: 'app-admin-inversiones',
  standalone: true,
  imports: [EditorEsquemaMarco],
  template: `
    <app-editor-esquema-marco
      [editor]="this"
      modulo="inversiones"
      titulo="Inversiones"
      sub="Los cambios guardados se actualizarán directamente en la sección Inversiones de la web."
      publicPath="/inversiones"
      [tabs]="tabs"
      [schema]="schema"
      [(activa)]="activa"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInversiones extends EditorModuloBase<'inversiones'> {
  protected readonly moduloId = 'inversiones' as const;
  readonly schema = INVERSIONES_SCHEMA;
  readonly tabs = INVERSIONES_TABS;
  readonly activa = signal(INVERSIONES_TABS[0].id);
}
