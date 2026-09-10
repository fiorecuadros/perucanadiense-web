import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { ModuloId } from '../../../core/models/documento.model';
import type { CampoSchema } from '../editor-contenido/schema';
import { TablaDocumentos } from '../tabla-documentos/tabla-documentos';
import { EditorEsquema } from './editor-esquema';
import type { EditorEsquemaHost, EditorModuloVista } from './editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from './editor-modulo-marco';

/**
 * Editor de módulo completo dirigido por esquema: marco (cabecera, pestañas,
 * guardado), campos amigables de la pestaña activa y tabla de documentos de la
 * sección. Cada módulo solo aporta id, título, esquema y pestañas.
 */
@Component({
  selector: 'app-editor-esquema-marco',
  standalone: true,
  imports: [EditorModuloMarco, EditorEsquema, TablaDocumentos],
  template: `
    <app-editor-modulo-marco
      [editor]="editor()"
      [titulo]="titulo()"
      [sub]="sub()"
      [publicPath]="publicPath()"
      [tabs]="tabs()"
      [(activa)]="activa"
    >
      <app-editor-esquema
        [host]="editor()"
        [titulo]="tabActivaLabel()"
        [schema]="camposActivos()"
      />
      <div extra>
        <app-tabla-documentos [modulo]="modulo()" [seccion]="activa()" />
      </div>
    </app-editor-modulo-marco>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorEsquemaMarco {
  readonly editor = input.required<EditorModuloVista & EditorEsquemaHost>();
  readonly modulo = input.required<ModuloId>();
  readonly titulo = input.required<string>();
  readonly sub = input('Los cambios guardados se actualizarán directamente en la web.');
  readonly publicPath = input.required<string>();
  readonly tabs = input.required<readonly MarcoTab[]>();
  readonly schema = input.required<CampoSchema[]>();
  readonly activa = model.required<string>();

  readonly camposActivos = computed(() =>
    this.schema().filter((campo) => campo.seccion === this.activa()),
  );
  readonly tabActivaLabel = computed(
    () => this.tabs().find((tab) => tab.id === this.activa())?.label ?? this.titulo(),
  );
}
