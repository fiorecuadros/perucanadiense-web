import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from '../../shared/editor-modulo/editor-modulo-marco';
import { ServiciosPanelHub } from './panel-hub';
import { SERVICIOS_TABS } from './servicios.schema';

const TABS: MarcoTab[] = SERVICIOS_TABS.map((t) => ({ id: t.id, label: t.label }));

@Component({
  selector: 'app-admin-servicios',
  standalone: true,
  imports: [EditorModuloMarco, ServiciosPanelHub],
  template: `
    <app-editor-modulo-marco
      [editor]="this"
      titulo="Servicios"
      sub="Los cambios guardados se actualizarán directamente en la sección Servicios de la web."
      publicPath="/servicios"
      [tabs]="tabs"
      [(activa)]="activa"
    >
      <app-servicios-panel-hub
        [items]="draft().hub"
        (itemsChange)="parche({ hub: $event })"
        (pedirEliminar)="confirmarEliminar($event)"
      />
    </app-editor-modulo-marco>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminServicios extends EditorModuloBase<'servicios'> {
  protected readonly moduloId = 'servicios' as const;
  protected override mensajeGuardado =
    'Los cambios ya están publicados en la sección Servicios de la web.';

  readonly tabs = TABS;
  readonly activa = signal(TABS[0].id);

  confirmarEliminar(index: number): void {
    const nombre = this.draft().hub[index]?.titulo?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar tarjeta de servicio',
      detalle: nombre
        ? `Se eliminará la tarjeta «${nombre}». Esta acción no se puede deshacer.`
        : 'Se eliminará esta tarjeta. Esta acción no se puede deshacer.',
      accion: () => this.parche({ hub: this.draft().hub.filter((_, i) => i !== index) }),
    });
  }
}
