import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { EditorEsquema } from '../../shared/editor-modulo/editor-esquema';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from '../../shared/editor-modulo/editor-modulo-marco';
import { TransparenciaPanelRubros } from './panel-rubros';
import { TRANSPARENCIA_SCHEMA, TRANSPARENCIA_TABS } from './transparencia.schema';

const TABS: MarcoTab[] = TRANSPARENCIA_TABS.map((t) => ({ id: t.id, label: t.label }));

@Component({
  selector: 'app-admin-transparencia',
  standalone: true,
  imports: [EditorModuloMarco, EditorEsquema, TransparenciaPanelRubros],
  template: `
    <app-editor-modulo-marco
      [editor]="this"
      titulo="Transparencia"
      sub="Los cambios guardados se actualizarán directamente en la sección Transparencia de la web."
      publicPath="/transparencia"
      [tabs]="tabs"
      [(activa)]="activa"
    >
      @switch (activa()) {
        @case ('portada') {
          <app-editor-esquema [host]="this" titulo="Portada" [schema]="camposPortada()" />
        }
        @case ('rubros') {
          <app-transparencia-panel-rubros
            [items]="draft().rubros"
            (itemsChange)="parche({ rubros: $event })"
            (pedirEliminar)="confirmarEliminarRubro($event)"
          />
        }
      }
    </app-editor-modulo-marco>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTransparencia extends EditorModuloBase<'transparencia'> {
  protected readonly moduloId = 'transparencia' as const;
  protected override mensajeGuardado =
    'Los cambios ya están publicados en la sección Transparencia de la web.';

  readonly tabs = TABS;
  readonly activa = signal(TABS[0].id);

  readonly camposPortada = computed(() =>
    TRANSPARENCIA_SCHEMA.filter((campo) => campo.seccion === 'portada'),
  );

  confirmarEliminarRubro(index: number): void {
    const nombre = this.draft().rubros[index]?.titulo?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar rubro',
      detalle: nombre
        ? `Se eliminará el rubro «${nombre}». Esta acción no se puede deshacer.`
        : 'Se eliminará este rubro. Esta acción no se puede deshacer.',
      accion: () => this.parche({ rubros: this.draft().rubros.filter((_, i) => i !== index) }),
    });
  }
}
