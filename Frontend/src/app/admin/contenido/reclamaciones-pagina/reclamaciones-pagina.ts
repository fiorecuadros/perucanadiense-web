import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { EditorEsquema } from '../../shared/editor-modulo/editor-esquema';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from '../../shared/editor-modulo/editor-modulo-marco';
import { PanelEtiquetas } from '../../shared/panel-etiquetas/panel-etiquetas';
import { PanelTarjetas, type CampoTarjeta } from '../../shared/panel-tarjetas/panel-tarjetas';
import {
  RECLAMACIONES_PAGINA_SCHEMA,
  RECLAMACIONES_PAGINA_TABS,
} from './reclamaciones-pagina.schema';

const TABS: MarcoTab[] = RECLAMACIONES_PAGINA_TABS.map((t) => ({ id: t.id, label: t.label }));

const CAMPOS_PASO: CampoTarjeta[] = [
  { key: 'titulo', label: 'Título del paso', tipo: 'texto', placeholder: 'ejemplo: Registro' },
  {
    key: 'descripcion',
    label: 'Qué hace el usuario en este paso',
    tipo: 'multilinea',
    placeholder: 'Explique el paso en una o dos frases',
  },
];

@Component({
  selector: 'app-admin-reclamaciones-pagina',
  standalone: true,
  imports: [EditorModuloMarco, EditorEsquema, PanelEtiquetas, PanelTarjetas],
  template: `
    <app-editor-modulo-marco
      [editor]="this"
      titulo="Libro de reclamaciones"
      sub="Los cambios guardados se actualizarán directamente en la página del libro de reclamaciones."
      publicPath="/reclamaciones"
      [tabs]="tabs"
      [(activa)]="activa"
    >
      @switch (activa()) {
        @case ('portada') {
          <app-editor-esquema [host]="this" titulo="Portada" [schema]="camposPortada()" />
        }
        @case ('pasos') {
          <app-panel-tarjetas
            [items]="$any(draft().pasos)"
            [campos]="camposPaso"
            titulo="Pasos del trámite"
            sub="Se numeran solos según el orden. Arrastre para reordenar."
            sufijo="pasos"
            singular="paso"
            autonumerar="paso"
            [nuevo]="{ paso: 0, titulo: '', descripcion: '' }"
            (itemsChange)="parche({ pasos: $any($event) })"
            (pedirEliminar)="confirmarEliminarPaso($event)"
          />
        }
        @case ('tipos') {
          <div class="dos-listas">
            <app-panel-etiquetas
              [items]="draft().tiposDocumento"
              titulo="Tipos de documento"
              sub="Opciones del menú «tipo de documento» del formulario."
              sufijo="tipos"
              singular="tipo"
              campoLabel="Tipo de documento"
              campoPlaceholder="ejemplo: DNI"
              (itemsChange)="parche({ tiposDocumento: $any($event) })"
              (pedirEliminar)="quitarDe('tiposDocumento', $event)"
            />
            <app-panel-etiquetas
              [items]="draft().tiposReclamo"
              titulo="Tipos de reclamo"
              sub="Opciones del menú «tipo de reclamo» del formulario."
              sufijo="tipos"
              singular="tipo"
              campoLabel="Tipo de reclamo"
              campoPlaceholder="ejemplo: Queja"
              (itemsChange)="parche({ tiposReclamo: $any($event) })"
              (pedirEliminar)="quitarDe('tiposReclamo', $event)"
            />
          </div>
        }
      }
    </app-editor-modulo-marco>
  `,
  styles: `
    .dos-listas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 26px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReclamacionesPagina extends EditorModuloBase<'reclamaciones'> {
  protected readonly moduloId = 'reclamaciones' as const;
  protected override mensajeGuardado =
    'Los cambios ya están publicados en la página del libro de reclamaciones.';

  readonly tabs = TABS;
  readonly activa = signal(TABS[0].id);
  readonly camposPaso = CAMPOS_PASO;

  readonly camposPortada = computed(() =>
    RECLAMACIONES_PAGINA_SCHEMA.filter((campo) => campo.seccion === 'portada'),
  );

  confirmarEliminarPaso(index: number): void {
    const nombre = this.draft().pasos[index]?.titulo?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar paso',
      detalle: nombre
        ? `Se eliminará el paso «${nombre}» y los demás se renumeran.`
        : 'Se eliminará este paso y los demás se renumeran.',
      accion: () => {
        const pasos = this.draft()
          .pasos.filter((_, i) => i !== index)
          .map((p, i) => ({ ...p, paso: i + 1 }));
        this.parche({ pasos });
      },
    });
  }

  quitarDe(clave: 'tiposDocumento' | 'tiposReclamo', index: number): void {
    const valor = this.draft()[clave][index]?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar opción',
      detalle: valor
        ? `Se quitará «${valor}» del formulario.`
        : 'Se quitará esta opción del formulario.',
      accion: () => this.parche({ [clave]: this.draft()[clave].filter((_, i) => i !== index) }),
    });
  }
}
