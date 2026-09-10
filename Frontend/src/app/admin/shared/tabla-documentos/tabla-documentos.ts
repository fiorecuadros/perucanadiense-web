import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DialogComponent } from '../../../shared/ui';
import type { DocumentoInstitucional, ModuloId } from '../../../core/models/documento.model';
import { ArchivosStore } from '../../../core/store/archivos.store';
import { DocumentosStore } from '../../../core/store/documentos.store';
import { SelectorArchivo } from '../selector-archivo/selector-archivo';
import { EditorQuill } from '../editor-quill/editor-quill';
import { ToastService } from '../toast/toast';
import { VisorPdf } from '../visor-pdf/visor-pdf';
import { excerpt } from '../../../core/utils/html';

interface DocForm {
  titulo: string;
  descripcion: string;
  tipo: DocumentoInstitucional['tipo'];
  url: string;
  anio: string;
  estado: DocumentoInstitucional['estado'];
  orden: number;
}

const VACIO: DocForm = {
  titulo: '',
  descripcion: '',
  tipo: 'pdf',
  url: '',
  anio: '',
  estado: 'publicado',
  orden: 1,
};

@Component({
  selector: 'app-tabla-documentos',
  standalone: true,
  imports: [DialogComponent, SelectorArchivo, VisorPdf, EditorQuill],
  template: `
    <div class="page-header" style="margin-bottom:12px">
      <div>
        <h3 class="page-title" style="font-size:1.05rem">Documentos de esta sección</h3>
        <p class="page-sub">
          PDF, enlace o imagen. Los borradores no aparecen en el sitio público.
        </p>
      </div>
      <button type="button" class="btn-add" (click)="abrirNuevo()">
        <i class="fa fa-plus"></i> Subir o registrar
      </button>
    </div>

    @if (docs().length === 0) {
      <div class="empty-state">
        <i class="fa fa-file-circle-plus"></i>
        <p>Aún no hay documentos en esta pestaña.</p>
      </div>
    } @else {
      <div class="admin-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Año</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (doc of docs(); track doc.id) {
              <tr>
                <td>
                  <strong>{{ doc.titulo }}</strong>
                  @if (doc.descripcion) {
                    <div class="form-hint">{{ bajada(doc.descripcion) }}</div>
                  }
                </td>
                <td>{{ doc.tipo }}</td>
                <td>
                  <span
                    class="badge"
                    [class.badge-publicado]="doc.estado === 'publicado'"
                    [class.badge-borrador]="doc.estado === 'borrador'"
                  >
                    {{ doc.estado === 'publicado' ? 'Publicado' : 'Borrador' }}
                  </span>
                </td>
                <td>{{ doc.anio || '—' }}</td>
                <td class="td-actions">
                  <button
                    type="button"
                    class="btn-icon"
                    (click)="previsualizar(doc)"
                    aria-label="Previsualizar"
                  >
                    <i class="fa fa-eye"></i>
                  </button>
                  <button
                    type="button"
                    class="btn-icon"
                    (click)="abrirEditar(doc)"
                    aria-label="Editar"
                  >
                    <i class="fa fa-pen"></i>
                  </button>
                  <button
                    type="button"
                    class="btn-icon btn-delete"
                    (click)="confirm.set(doc)"
                    aria-label="Quitar"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <app-dialog [open]="formAbierto()" title="Documento" (openChange)="onFormOpen($event)">
      <div class="form-row">
        <label for="doc-titulo">Título</label>
        <input
          id="doc-titulo"
          type="text"
          [class.campo-error]="tituloVacio()"
          [value]="form().titulo"
          (input)="patch('titulo', $any($event.target).value)"
        />
      </div>
      <div class="form-row">
        <label for="doc-desc">Descripción</label>
        <app-editor-quill compacto [html]="form().descripcion" (htmlChange)="patch('descripcion', $event)" />
      </div>
      <div class="form-grid">
        <div class="form-row">
          <label for="doc-tipo">Tipo</label>
          <select
            id="doc-tipo"
            [value]="form().tipo"
            (change)="patch('tipo', $any($event.target).value)"
          >
            <option value="pdf">PDF</option>
            <option value="enlace">Enlace</option>
            <option value="imagen">Imagen</option>
          </select>
        </div>
        <div class="form-row">
          <label for="doc-estado">Estado</label>
          <select
            id="doc-estado"
            [value]="form().estado"
            (change)="patch('estado', $any($event.target).value)"
          >
            <option value="publicado">Publicado</option>
            <option value="borrador">Borrador</option>
          </select>
        </div>
        <div class="form-row">
          <label for="doc-anio">Año</label>
          <input
            id="doc-anio"
            type="text"
            [value]="form().anio"
            (input)="patch('anio', $any($event.target).value)"
          />
        </div>
        <div class="form-row">
          <label for="doc-orden">Orden</label>
          <input
            id="doc-orden"
            type="number"
            [value]="form().orden"
            (input)="patchNumero('orden', $event)"
          />
        </div>
      </div>
      <div class="form-row">
        <label for="doc-url">URL o referencia</label>
        <input
          id="doc-url"
          type="text"
          [value]="form().url"
          (input)="patch('url', $any($event.target).value)"
        />
      </div>
      @if (form().tipo !== 'enlace') {
        <app-selector-archivo
          [modo]="form().tipo === 'imagen' ? 'imagen' : 'pdf'"
          [referencia]="form().url"
          (referenciaChange)="patch('url', $event)"
        />
      }
      <div dialog-footer>
        <button type="button" class="btn-cancel" (click)="formAbierto.set(false)">Cancelar</button>
        <button type="button" class="btn-save" (click)="guardarForm()">Guardar</button>
      </div>
    </app-dialog>

    <app-dialog
      [open]="!!preview()"
      [title]="preview()?.titulo ?? 'Vista previa'"
      (openChange)="onPreviewOpen($event)"
      [showFooter]="true"
    >
      @if (preview(); as doc) {
        @if (doc.tipo === 'pdf') {
          <app-visor-pdf [src]="previewUrl()" modo="mini" />
        } @else if (doc.tipo === 'imagen') {
          <img [src]="previewUrl()" [alt]="doc.titulo" style="max-width:100%;border-radius:8px" />
        } @else {
          <p>
            <a [href]="previewUrl()" target="_blank" rel="noopener noreferrer">{{ doc.url }}</a>
          </p>
        }
      }
      <div dialog-footer>
        <button type="button" class="btn-cancel" (click)="preview.set(null)">Cerrar</button>
      </div>
    </app-dialog>

    <app-dialog [open]="!!confirm()" title="Quitar documento" (openChange)="onConfirmOpen($event)">
      <p>
        Puede pasarlo a borrador (deja de verse en el público) o eliminarlo de forma definitiva.
      </p>
      <div dialog-footer>
        <button type="button" class="btn-cancel" (click)="confirm.set(null)">Seguir aquí</button>
        <button type="button" class="btn-ghost" (click)="quitar(0)">Pasar a borrador</button>
        <button type="button" class="btn-danger" (click)="quitar(1)">Eliminar</button>
      </div>
    </app-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaDocumentos {
  private readonly documentos = inject(DocumentosStore);
  private readonly archivos = inject(ArchivosStore);
  private readonly toast = inject(ToastService);

  readonly modulo = input.required<ModuloId>();
  readonly seccion = input.required<string>();

  readonly docs = computed(() => this.documentos.deSeccion(this.modulo(), this.seccion(), true));

  readonly formAbierto = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly form = signal<DocForm>({ ...VACIO });
  readonly preview = signal<DocumentoInstitucional | null>(null);
  readonly previewUrl = signal('');
  readonly confirm = signal<DocumentoInstitucional | null>(null);
  readonly tituloVacio = signal(false);

  bajada(texto: string): string {
    return excerpt(texto, 140);
  }

  abrirNuevo(): void {
    const max = this.docs().reduce((n, d) => Math.max(n, d.orden), 0);
    this.editingId.set(null);
    this.form.set({ ...VACIO, orden: max + 1 });
    this.tituloVacio.set(false);
    this.formAbierto.set(true);
  }

  abrirEditar(doc: DocumentoInstitucional): void {
    this.editingId.set(doc.id);
    this.form.set({
      titulo: doc.titulo,
      descripcion: doc.descripcion ?? '',
      tipo: doc.tipo,
      url: doc.url,
      anio: doc.anio ?? '',
      estado: doc.estado,
      orden: doc.orden,
    });
    this.tituloVacio.set(false);
    this.formAbierto.set(true);
  }

  patch<K extends keyof DocForm>(key: K, value: DocForm[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  patchNumero(key: 'orden', event: Event): void {
    const input = event.target as HTMLInputElement;
    this.patch(key, Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : 1);
  }

  async guardarForm(): Promise<void> {
    const data = this.form();
    if (!data.titulo.trim()) {
      this.tituloVacio.set(true);
      this.toast.error('El título es obligatorio.');
      return;
    }
    if (!data.url.trim()) {
      this.toast.error('Indique una URL o suba un archivo.');
      return;
    }
    const id = this.editingId();
    try {
      if (id) {
        await this.documentos.actualizar({
          id,
          modulo: this.modulo(),
          seccion: this.seccion(),
          titulo: data.titulo.trim(),
          descripcion: data.descripcion.trim() || undefined,
          tipo: data.tipo,
          url: data.url.trim(),
          anio: data.anio.trim() || undefined,
          orden: data.orden,
          estado: data.estado,
          actualizadoEn: new Date().toISOString(),
        });
        this.toast.success('Documento actualizado.');
      } else {
        await this.documentos.crear({
          modulo: this.modulo(),
          seccion: this.seccion(),
          titulo: data.titulo.trim(),
          descripcion: data.descripcion.trim() || undefined,
          tipo: data.tipo,
          url: data.url.trim(),
          anio: data.anio.trim() || undefined,
          orden: data.orden,
          estado: data.estado,
        });
        this.toast.success('Documento publicado en esta sección.');
      }
      this.formAbierto.set(false);
    } catch {
      this.toast.error('No se pudo guardar el documento.');
    }
  }

  async previsualizar(doc: DocumentoInstitucional): Promise<void> {
    this.preview.set(doc);
    this.previewUrl.set(await this.archivos.resolver(doc.url));
  }

  async quitar(modo: 0 | 1): Promise<void> {
    const doc = this.confirm();
    if (!doc) return;
    await this.documentos.eliminar(doc.id, modo);
    this.confirm.set(null);
    this.toast.success(modo === 0 ? 'Pasó a borrador.' : 'Documento eliminado.');
  }

  onFormOpen(open: boolean): void {
    this.formAbierto.set(open);
  }

  onPreviewOpen(open: boolean): void {
    if (!open) this.preview.set(null);
  }

  onConfirmOpen(open: boolean): void {
    if (!open) this.confirm.set(null);
  }
}
