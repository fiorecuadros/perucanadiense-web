import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorEsquemaMarco } from '../../shared/editor-modulo/editor-esquema-marco';
import { ESTADISTICAS_SCHEMA, ESTADISTICAS_TABS } from './estadisticas.schema';

@Component({
  selector: 'app-admin-estadisticas',
  standalone: true,
  imports: [EditorEsquemaMarco],
  template: `
    <app-editor-esquema-marco
      [editor]="this"
      modulo="estadisticas"
      titulo="Estadísticas"
      sub="Los cambios guardados se actualizarán directamente en la sección Estadísticas de la web."
      publicPath="/estadisticas"
      [tabs]="tabs"
      [schema]="schema"
      [(activa)]="activa"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEstadisticas extends EditorModuloBase<'estadisticas'> {
  protected readonly moduloId = 'estadisticas' as const;
  readonly schema = ESTADISTICAS_SCHEMA;
  readonly tabs = ESTADISTICAS_TABS;
  readonly activa = signal(ESTADISTICAS_TABS[0].id);
}
