import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentosStore } from '../../core/store/documentos.store';
import {
  MODULO_META,
  type DocumentoInstitucional,
  type ModuloId,
} from '../../core/models/documento.model';
import { DialogComponent } from '../../shared/ui';
import { ToastService } from '../shared/toast/toast';

@Component({
  selector: 'app-admin-documentos',
  standalone: true,
  imports: [RouterLink, DialogComponent],
  templateUrl: './documentos.component.html',
  styleUrl: './documentos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDocumentosComponent {
  private readonly documentos = inject(DocumentosStore);
  private readonly toast = inject(ToastService);

  readonly modulos = MODULO_META;
  readonly filtroModulo = signal<ModuloId | 'todos'>('todos');
  readonly filtroEstado = signal<'todos' | 'publicado' | 'borrador'>('todos');
  readonly confirmar = signal<DocumentoInstitucional | null>(null);
  readonly restaurando = signal<ModuloId | null>(null);

  readonly lista = computed(() => {
    const modulo = this.filtroModulo();
    const estado = this.filtroEstado();
    return this.documentos
      .lista()
      .filter((d) => (modulo === 'todos' ? true : d.modulo === modulo))
      .filter((d) => (estado === 'todos' ? true : d.estado === estado))
      .slice()
      .sort(
        (a, b) =>
          a.modulo.localeCompare(b.modulo, 'es') ||
          a.seccion.localeCompare(b.seccion, 'es') ||
          a.orden - b.orden,
      );
  });

  readonly publicados = computed(
    () => this.documentos.lista().filter((d) => d.estado === 'publicado').length,
  );
  readonly borradores = computed(
    () => this.documentos.lista().filter((d) => d.estado === 'borrador').length,
  );

  tituloModulo(id: string): string {
    return this.modulos.find((m) => m.id === id)?.titulo ?? id;
  }

  rutaAdmin(id: string): string {
    return this.modulos.find((m) => m.id === id)?.adminPath ?? '/admin/contenido';
  }

  /**
   * El alta y la edición fina de cada documento viven dentro del editor de su
   * módulo (ahí se ve en qué pestaña cae). Esta pantalla es la vista de conjunto:
   * qué hay publicado, qué quedó en borrador y qué falta por rubro.
   */
  async alternarEstado(documento: DocumentoInstitucional): Promise<void> {
    const estado = documento.estado === 'publicado' ? 'borrador' : 'publicado';
    try {
      await this.documentos.actualizar({ ...documento, estado });
      this.toast.success(
        estado === 'publicado'
          ? 'Documento publicado en el portal.'
          : 'Documento pasado a borrador.',
      );
    } catch {
      this.toast.error('No se pudo cambiar el estado.');
    }
  }

  async eliminar(): Promise<void> {
    const documento = this.confirmar();
    if (!documento) return;
    try {
      await this.documentos.eliminar(documento.id, 1);
      this.confirmar.set(null);
      this.toast.success('Documento eliminado.');
    } catch {
      this.toast.error('No se pudo eliminar el documento.');
    }
  }

  async restaurar(modulo: ModuloId): Promise<void> {
    this.restaurando.set(modulo);
    try {
      await this.documentos.restaurarModulo(modulo);
      this.toast.success(`Se repusieron los documentos oficiales de ${this.tituloModulo(modulo)}.`);
    } catch {
      this.toast.error('No se pudo restaurar el módulo.');
    } finally {
      this.restaurando.set(null);
    }
  }

  fecha(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-PE', { dateStyle: 'medium' });
  }
}
