import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { EditorEsquema } from '../../shared/editor-modulo/editor-esquema';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from '../../shared/editor-modulo/editor-modulo-marco';
import { PanelTarjetas, type CampoTarjeta } from '../../shared/panel-tarjetas/panel-tarjetas';
import { PRIVACIDAD_SCHEMA, PRIVACIDAD_TABS } from './privacidad.schema';

const TABS: MarcoTab[] = PRIVACIDAD_TABS.map((t) => ({ id: t.id, label: t.label }));

const CAMPOS_SECCION: CampoTarjeta[] = [
  {
    key: 'title',
    label: 'Título de la sección',
    tipo: 'texto',
    placeholder: 'ejemplo: Finalidad del tratamiento',
  },
  {
    key: 'body',
    label: 'Texto de la sección',
    tipo: 'multilinea',
    hint: 'Deje una línea en blanco entre párrafos.',
  },
];

@Component({
  selector: 'app-admin-privacidad',
  standalone: true,
  imports: [EditorModuloMarco, EditorEsquema, PanelTarjetas],
  template: `
    <app-editor-modulo-marco
      [editor]="this"
      titulo="Privacidad"
      sub="Los cambios guardados se actualizarán directamente en la política de privacidad de la web."
      publicPath="/privacidad"
      [tabs]="tabs"
      [(activa)]="activa"
    >
      @switch (activa()) {
        @case ('portada') {
          <app-editor-esquema [host]="this" titulo="Portada" [schema]="camposPortada()" />
        }
        @case ('secciones') {
          <app-panel-tarjetas
            [items]="$any(draft().sections)"
            [campos]="camposSeccion"
            titulo="Secciones de la política"
            sub="Cada tarjeta es un apartado de la política de privacidad. Arrastre para reordenar."
            sufijo="secciones"
            singular="sección"
            [nuevo]="{ title: '', body: '' }"
            (itemsChange)="parche({ sections: $any($event) })"
            (pedirEliminar)="confirmarEliminar($event)"
          />
        }
      }
    </app-editor-modulo-marco>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPrivacidad extends EditorModuloBase<'privacidad'> {
  protected readonly moduloId = 'privacidad' as const;
  protected override mensajeGuardado =
    'Los cambios ya están publicados en la política de privacidad.';

  readonly tabs = TABS;
  readonly activa = signal(TABS[0].id);
  readonly camposSeccion = CAMPOS_SECCION;

  readonly camposPortada = computed(() =>
    PRIVACIDAD_SCHEMA.filter((campo) => campo.seccion === 'portada'),
  );

  confirmarEliminar(index: number): void {
    const nombre = this.draft().sections[index]?.title?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar sección',
      detalle: nombre
        ? `Se eliminará la sección «${nombre}». Esta acción no se puede deshacer.`
        : 'Se eliminará esta sección. Esta acción no se puede deshacer.',
      accion: () => this.parche({ sections: this.draft().sections.filter((_, i) => i !== index) }),
    });
  }
}
