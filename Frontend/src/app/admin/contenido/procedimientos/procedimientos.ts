import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { EditorEsquema } from '../../shared/editor-modulo/editor-esquema';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from '../../shared/editor-modulo/editor-modulo-marco';
import { PanelEtiquetas } from '../../shared/panel-etiquetas/panel-etiquetas';
import { TablaDocumentos } from '../../shared/tabla-documentos/tabla-documentos';
import { PROCEDIMIENTOS_SCHEMA, PROCEDIMIENTOS_TABS } from './procedimientos.schema';

const TABS: MarcoTab[] = PROCEDIMIENTOS_TABS.map((t) => ({ id: t.id, label: t.label }));

@Component({
  selector: 'app-admin-procedimientos',
  standalone: true,
  imports: [EditorModuloMarco, EditorEsquema, PanelEtiquetas, TablaDocumentos],
  template: `
    <app-editor-modulo-marco
      [editor]="this"
      titulo="Procedimientos"
      sub="Los cambios guardados se actualizarán directamente en la sección Procedimientos de la web."
      publicPath="/procedimientos"
      [tabs]="tabs"
      [(activa)]="activa"
    >
      @switch (activa()) {
        @case ('portada') {
          <app-editor-esquema [host]="this" titulo="Portada" [schema]="camposPortada()" />
        }
        @case ('tramites') {
          <app-panel-etiquetas
            [items]="draft().tramites"
            campo="label"
            titulo="Trámites del visor"
            sub="Los apartados que aparecen en la página de procedimientos."
            sufijo="trámites"
            singular="trámite"
            campoLabel="Nombre del trámite"
            campoPlaceholder="ejemplo: Titulación"
            (itemsChange)="parche({ tramites: $any($event) })"
            (pedirEliminar)="confirmarEliminarTramite($event)"
          />
        }
      }

      <div extra>
        <app-tabla-documentos modulo="procedimientos" [seccion]="activa()" />
      </div>
    </app-editor-modulo-marco>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProcedimientos extends EditorModuloBase<'procedimientos'> {
  protected readonly moduloId = 'procedimientos' as const;
  protected override mensajeGuardado =
    'Los cambios ya están publicados en la sección Procedimientos de la web.';

  readonly tabs = TABS;
  readonly activa = signal(TABS[0].id);

  readonly camposPortada = computed(() =>
    PROCEDIMIENTOS_SCHEMA.filter((campo) => campo.seccion === 'portada'),
  );

  confirmarEliminarTramite(index: number): void {
    const nombre = this.draft().tramites[index]?.label?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar trámite',
      detalle: nombre
        ? `Se eliminará el apartado «${nombre}» de la página. Esta acción no se puede deshacer.`
        : 'Se eliminará este apartado de la página.',
      accion: () => this.parche({ tramites: this.draft().tramites.filter((_, i) => i !== index) }),
    });
  }
}
