import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { EditorEsquema } from '../../shared/editor-modulo/editor-esquema';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from '../../shared/editor-modulo/editor-modulo-marco';
import { ICONOS_PORTAL } from '../../shared/opciones-portal';
import { PanelServiciosBienestar } from '../../shared/panel-servicios-bienestar/panel-servicios-bienestar';
import { PanelTarjetas, type CampoTarjeta } from '../../shared/panel-tarjetas/panel-tarjetas';
import { SOPORTE_MEDICO_SCHEMA, SOPORTE_MEDICO_TABS } from './soporte-medico.schema';

const TABS: MarcoTab[] = SOPORTE_MEDICO_TABS.map((t) => ({ id: t.id, label: t.label }));

const CAMPOS_EMERGENCIA: CampoTarjeta[] = [
  { key: 'titulo', label: 'Nombre del contacto', tipo: 'texto', placeholder: 'ejemplo: SAMU' },
  { key: 'descripcion', label: 'Descripción', tipo: 'texto', placeholder: 'Cuándo llamar aquí' },
  {
    key: 'telefono',
    label: 'Teléfono',
    tipo: 'texto',
    placeholder: 'ejemplo: 106',
    hint: 'Si lo deja vacío, se usa la central del instituto.',
  },
  { key: 'icon', label: 'Ícono', tipo: 'seleccion', opciones: ICONOS_PORTAL, iconoPreview: true },
];

@Component({
  selector: 'app-admin-soporte-medico',
  standalone: true,
  imports: [EditorModuloMarco, EditorEsquema, PanelServiciosBienestar, PanelTarjetas],
  template: `
    <app-editor-modulo-marco
      [editor]="this"
      titulo="Soporte médico"
      sub="Los cambios guardados se actualizarán directamente en la página de soporte médico."
      publicPath="/soporte-medico"
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
            (itemsChange)="parche({ servicios: $event })"
            (pedirEliminar)="confirmarEliminarServicio($event)"
          />
        }
        @case ('emergencias') {
          <app-panel-tarjetas
            [items]="$any(draft().emergencias)"
            [campos]="camposEmergencia"
            titulo="Contactos de emergencia"
            sub="Los teléfonos que se muestran en la página de soporte médico."
            sufijo="contactos"
            singular="contacto"
            [nuevo]="{ titulo: '', descripcion: '', telefono: '', icon: 'fa-phone' }"
            (itemsChange)="parche({ emergencias: $any($event) })"
            (pedirEliminar)="confirmarEliminarEmergencia($event)"
          />
        }
      }
    </app-editor-modulo-marco>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSoporteMedico extends EditorModuloBase<'soporte-medico'> {
  protected readonly moduloId = 'soporte-medico' as const;
  protected override mensajeGuardado =
    'Los cambios ya están publicados en la página de soporte médico.';

  readonly tabs = TABS;
  readonly activa = signal(TABS[0].id);
  readonly camposEmergencia = CAMPOS_EMERGENCIA;

  readonly camposPortada = computed(() =>
    SOPORTE_MEDICO_SCHEMA.filter((campo) => campo.seccion === 'portada'),
  );

  confirmarEliminarServicio(index: number): void {
    const nombre = this.draft().servicios[index]?.titulo?.trim();
    this.pedirConfirmacion(
      this.dialogo(nombre, 'servicio', () =>
        this.parche({ servicios: this.draft().servicios.filter((_, i) => i !== index) }),
      ),
    );
  }

  confirmarEliminarEmergencia(index: number): void {
    const nombre = this.draft().emergencias[index]?.titulo?.trim();
    this.pedirConfirmacion(
      this.dialogo(nombre, 'contacto', () =>
        this.parche({ emergencias: this.draft().emergencias.filter((_, i) => i !== index) }),
      ),
    );
  }

  private dialogo(nombre: string | undefined, tipo: string, accion: () => void) {
    return {
      titulo: `Eliminar ${tipo}`,
      detalle: nombre
        ? `Se eliminará «${nombre}». Esta acción no se puede deshacer.`
        : `Se eliminará este ${tipo}. Esta acción no se puede deshacer.`,
      accion,
    };
  }
}
