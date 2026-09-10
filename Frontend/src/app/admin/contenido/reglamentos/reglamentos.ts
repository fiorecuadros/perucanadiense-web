import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { EditorEsquema } from '../../shared/editor-modulo/editor-esquema';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from '../../shared/editor-modulo/editor-modulo-marco';
import { PanelEtiquetas } from '../../shared/panel-etiquetas/panel-etiquetas';
import { TablaDocumentos } from '../../shared/tabla-documentos/tabla-documentos';
import { ReglamentosPanelDocumentos } from './panel-documentos';
import { REGLAMENTOS_SCHEMA, REGLAMENTOS_TABS } from './reglamentos.schema';

const TABS: MarcoTab[] = REGLAMENTOS_TABS.map((t) => ({ id: t.id, label: t.label }));

@Component({
  selector: 'app-admin-reglamentos',
  standalone: true,
  imports: [
    EditorModuloMarco,
    EditorEsquema,
    PanelEtiquetas,
    TablaDocumentos,
    ReglamentosPanelDocumentos,
  ],
  template: `
    <app-editor-modulo-marco
      [editor]="this"
      titulo="Reglamentos"
      sub="Los cambios guardados se actualizarán directamente en la sección Reglamentos de la web."
      publicPath="/reglamentos"
      [tabs]="tabs"
      [(activa)]="activa"
    >
      @switch (activa()) {
        @case ('portada') {
          <app-editor-esquema [host]="this" titulo="Portada" [schema]="camposPortada()" />
        }
        @case ('categorias') {
          <app-panel-etiquetas
            [items]="draft().categorias"
            campo="nombre"
            titulo="Categorías del filtro"
            sub="Los botones para filtrar la lista de documentos en la web."
            sufijo="categorías"
            singular="categoría"
            campoLabel="Nombre de la categoría"
            campoPlaceholder="ejemplo: Directivas académicas"
            (itemsChange)="parche({ categorias: $any($event) })"
            (pedirEliminar)="confirmarEliminarCategoria($event)"
          />
        }
        @case ('documentos') {
          <app-reglamentos-panel-documentos
            [items]="draft().items"
            (itemsChange)="parche({ items: $event })"
            (pedirEliminar)="confirmarEliminarItem($event)"
          />
        }
      }

      <div extra>
        <app-tabla-documentos modulo="reglamentos" [seccion]="activa()" />
      </div>
    </app-editor-modulo-marco>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReglamentos extends EditorModuloBase<'reglamentos'> {
  protected readonly moduloId = 'reglamentos' as const;
  protected override mensajeGuardado =
    'Los cambios ya están publicados en la sección Reglamentos de la web.';

  readonly tabs = TABS;
  readonly activa = signal(TABS[0].id);

  readonly camposPortada = computed(() =>
    REGLAMENTOS_SCHEMA.filter((campo) => campo.seccion === 'portada'),
  );

  confirmarEliminarCategoria(index: number): void {
    const nombre = this.draft().categorias[index]?.nombre?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar categoría',
      detalle: nombre
        ? `Se eliminará la categoría «${nombre}». Los documentos que la usaban quedarán sin filtro.`
        : 'Se eliminará esta categoría.',
      accion: () =>
        this.parche({ categorias: this.draft().categorias.filter((_, i) => i !== index) }),
    });
  }

  confirmarEliminarItem(index: number): void {
    const nombre = this.draft().items[index]?.titulo?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar documento',
      detalle: nombre
        ? `Se eliminará «${nombre}» de la lista. Esta acción no se puede deshacer.`
        : 'Se eliminará este documento de la lista.',
      accion: () => this.parche({ items: this.draft().items.filter((_, i) => i !== index) }),
    });
  }
}
