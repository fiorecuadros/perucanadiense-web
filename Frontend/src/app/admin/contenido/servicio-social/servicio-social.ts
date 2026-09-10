import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { EditorEsquema } from '../../shared/editor-modulo/editor-esquema';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from '../../shared/editor-modulo/editor-modulo-marco';
import { PanelEtiquetas } from '../../shared/panel-etiquetas/panel-etiquetas';
import { PanelServiciosBienestar } from '../../shared/panel-servicios-bienestar/panel-servicios-bienestar';
import { SERVICIO_SOCIAL_SCHEMA, SERVICIO_SOCIAL_TABS } from './servicio-social.schema';

const TABS: MarcoTab[] = SERVICIO_SOCIAL_TABS.map((t) => ({ id: t.id, label: t.label }));

@Component({
  selector: 'app-admin-servicio-social',
  standalone: true,
  imports: [EditorModuloMarco, EditorEsquema, PanelEtiquetas, PanelServiciosBienestar],
  template: `
    <app-editor-modulo-marco
      [editor]="this"
      titulo="Servicio social"
      sub="Los cambios guardados se actualizarán directamente en la página del servicio social."
      publicPath="/servicio-social"
      [tabs]="tabs"
      [(activa)]="activa"
    >
      @switch (activa()) {
        @case ('portada') {
          <app-editor-esquema [host]="this" titulo="Portada" [schema]="camposPortada()" />
        }
        @case ('servicios') {
          <app-panel-servicios-bienestar
            [items]="draft().servicios"
            [conRequisitos]="true"
            (itemsChange)="parche({ servicios: $event })"
            (pedirEliminar)="confirmarEliminarServicio($event)"
          />
        }
        @case ('apoyo') {
          <app-panel-etiquetas
            [items]="draft().tiposApoyo"
            titulo="Tipos de apoyo del formulario"
            sub="Las opciones que puede elegir un estudiante al pedir apoyo en la web."
            sufijo="tipos de apoyo"
            singular="tipo de apoyo"
            campoLabel="Tipo de apoyo"
            campoPlaceholder="ejemplo: Apoyo económico"
            (itemsChange)="parche({ tiposApoyo: $any($event) })"
            (pedirEliminar)="confirmarEliminarApoyo($event)"
          />
        }
      }
    </app-editor-modulo-marco>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminServicioSocial extends EditorModuloBase<'servicio-social'> {
  protected readonly moduloId = 'servicio-social' as const;
  protected override mensajeGuardado =
    'Los cambios ya están publicados en la página del servicio social.';

  readonly tabs = TABS;
  readonly activa = signal(TABS[0].id);

  readonly camposPortada = computed(() =>
    SERVICIO_SOCIAL_SCHEMA.filter((campo) => campo.seccion === 'portada'),
  );

  confirmarEliminarServicio(index: number): void {
    const nombre = this.draft().servicios[index]?.titulo?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar servicio',
      detalle: nombre
        ? `Se eliminará el servicio «${nombre}». Esta acción no se puede deshacer.`
        : 'Se eliminará este servicio. Esta acción no se puede deshacer.',
      accion: () =>
        this.parche({ servicios: this.draft().servicios.filter((_, i) => i !== index) }),
    });
  }

  confirmarEliminarApoyo(index: number): void {
    const nombre = this.draft().tiposApoyo[index]?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar tipo de apoyo',
      detalle: nombre
        ? `Se quitará «${nombre}» de las opciones del formulario.`
        : 'Se quitará esta opción del formulario.',
      accion: () =>
        this.parche({ tiposApoyo: this.draft().tiposApoyo.filter((_, i) => i !== index) }),
    });
  }
}
