import { Injectable, computed, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../api/portal.api';
import { DOCUMENTOS_SEED } from '../constants/documentos.seed';
import type { DocumentoInstitucional, ModuloId } from '../models/documento.model';
import { ArchivosStore } from './archivos.store';
import { persisted, type PersistedStore } from './persisted-store';

const KEY = 'pc-documentos';

function ordenar(docs: DocumentoInstitucional[]): DocumentoInstitucional[] {
  return [...docs].sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo, 'es'));
}

@Injectable({ providedIn: 'root' })
export class DocumentosStore {
  private readonly api = inject(PortalApi);
  private readonly archivos = inject(ArchivosStore);
  private readonly store: PersistedStore<DocumentoInstitucional[]> = persisted(
    KEY,
    DOCUMENTOS_SEED,
  );

  readonly lista = this.store.value;
  readonly modificado = this.store.modificado;

  porModulo(modulo: ModuloId, incluirBorradores = false) {
    return computed(() => this.deModulo(modulo, incluirBorradores));
  }

  porSeccion(modulo: ModuloId, seccion: string, incluirBorradores = false) {
    return computed(() => this.deSeccion(modulo, seccion, incluirBorradores));
  }

  deModulo(modulo: ModuloId, incluirBorradores = false): DocumentoInstitucional[] {
    return ordenar(
      this.lista().filter(
        (d) => d.modulo === modulo && (incluirBorradores || d.estado === 'publicado'),
      ),
    );
  }

  deSeccion(
    modulo: ModuloId,
    seccion: string,
    incluirBorradores = false,
  ): DocumentoInstitucional[] {
    return ordenar(
      this.lista().filter(
        (d) =>
          d.modulo === modulo &&
          d.seccion === seccion &&
          (incluirBorradores || d.estado === 'publicado'),
      ),
    );
  }

  conteo(modulo: ModuloId): { publicados: number; borradores: number } {
    const docs = this.lista().filter((d) => d.modulo === modulo);
    return {
      publicados: docs.filter((d) => d.estado === 'publicado').length,
      borradores: docs.filter((d) => d.estado === 'borrador').length,
    };
  }

  async hidratar(soloPublicados: boolean): Promise<void> {
    if (!environment.useRemoteApi) return;
    try {
      const lista = await this.api.documentos({ publicados: soloPublicados });
      this.store.set(lista);
    } catch {
      // Se conserva el seed local.
    }
  }

  async crear(
    data: Omit<DocumentoInstitucional, 'id' | 'actualizadoEn'> & { id?: string },
  ): Promise<DocumentoInstitucional> {
    let created: DocumentoInstitucional = {
      ...data,
      id: data.id ?? crypto.randomUUID(),
      actualizadoEn: new Date().toISOString(),
    };
    if (environment.useRemoteApi) {
      created = await this.api.crearDocumento(data);
    }
    this.store.set([...this.lista(), created]);
    return created;
  }

  async actualizar(doc: DocumentoInstitucional): Promise<void> {
    const nextDoc = { ...doc, actualizadoEn: new Date().toISOString() };
    if (environment.useRemoteApi) {
      await this.api.actualizarDocumento(nextDoc);
    }
    this.store.set(this.lista().map((d) => (d.id === doc.id ? nextDoc : d)));
  }

  /**
   * modo 0 = pasar a borrador; modo 1 = borrar definitivo (y el blob si es IndexedDB).
   */
  async eliminar(id: string, modo: 0 | 1): Promise<void> {
    const actual = this.lista().find((d) => d.id === id);
    if (!actual) return;
    if (modo === 0) {
      await this.actualizar({ ...actual, estado: 'borrador' });
      return;
    }
    if (environment.useRemoteApi) {
      await this.api.eliminarDocumento(id);
    }
    if (this.archivos.esIdb(actual.url) || actual.url.includes('/archivos/')) {
      await this.archivos.eliminar(actual.url);
    }
    this.store.set(this.lista().filter((d) => d.id !== id));
  }

  /**
   * Repone los documentos oficiales del módulo. Con backend lo resuelve el
   * servidor en una sola llamada: borrar uno a uno desde aquí dejaba archivos
   * huérfanos y la semilla solo se reponía en este navegador.
   */
  async restaurarModulo(modulo: ModuloId): Promise<void> {
    if (environment.useRemoteApi) {
      const repuestos = await this.api.restaurarDocumentos(modulo);
      this.store.set([...this.lista().filter((d) => d.modulo !== modulo), ...repuestos]);
      return;
    }
    const actuales = this.lista().filter((d) => d.modulo === modulo);
    for (const doc of actuales) {
      if (this.archivos.esIdb(doc.url)) {
        await this.archivos.eliminar(doc.url);
      }
    }
    const seed = DOCUMENTOS_SEED.filter((d) => d.modulo === modulo).map((d) => structuredClone(d));
    this.store.set([...this.lista().filter((d) => d.modulo !== modulo), ...seed]);
  }

  async reset(): Promise<void> {
    for (const doc of this.lista()) {
      if (this.archivos.esIdb(doc.url) || doc.url.includes('/archivos/')) {
        await this.archivos.eliminar(doc.url);
      }
    }
    this.store.reset();
  }
}
