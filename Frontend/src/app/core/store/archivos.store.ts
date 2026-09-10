import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../api/portal.api';
import { archivoPublicoUrl } from '../api/endpoints';

const DB_NAME = 'pc-admin-files';
const STORE_NAME = 'blobs';
const DB_VERSION = 1;

function abrirDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB no disponible'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('No se pudo abrir IndexedDB'));
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return abrirDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const request = run(transaction.objectStore(STORE_NAME));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Operación IndexedDB fallida'));
      }),
  );
}

@Injectable({ providedIn: 'root' })
export class ArchivosStore {
  private readonly api = inject(PortalApi);
  private readonly objectUrls = new Map<string, string>();

  esIdb(url: string): boolean {
    return url.startsWith('idb:');
  }

  idDe(url: string): string {
    if (url.startsWith('idb:')) return url.slice(4);
    const match = url.match(/\/archivos\/([^/?#]+)/);
    return match?.[1] ?? url;
  }

  async guardar(file: File): Promise<string> {
    if (environment.useRemoteApi) {
      const subido = await this.api.subirArchivo(file);
      return subido.url || archivoPublicoUrl(subido.id);
    }
    const id = crypto.randomUUID();
    await tx('readwrite', (store) => store.put(file, id));
    return `idb:${id}`;
  }

  async url(idOrRef: string): Promise<string> {
    const id = this.idDe(idOrRef);
    const cached = this.objectUrls.get(id);
    if (cached) return cached;
    const blob = await tx<Blob | undefined>('readonly', (store) => store.get(id));
    if (!blob) return '';
    const objectUrl = URL.createObjectURL(blob);
    this.objectUrls.set(id, objectUrl);
    return objectUrl;
  }

  async resolver(url: string): Promise<string> {
    if (!url) return '';
    if (this.esIdb(url)) return this.url(url);
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/api/')) return `${environment.baseUrl}${url}`;
    return url;
  }

  async eliminar(idOrRef: string): Promise<void> {
    if (environment.useRemoteApi && !this.esIdb(idOrRef)) {
      try {
        await this.api.borrarArchivo(this.idDe(idOrRef));
      } catch {
        // El metadato del documento se borra igual.
      }
      return;
    }
    const id = this.idDe(idOrRef);
    const cached = this.objectUrls.get(id);
    if (cached) {
      URL.revokeObjectURL(cached);
      this.objectUrls.delete(id);
    }
    await tx('readwrite', (store) => store.delete(id));
  }

  async vaciar(): Promise<void> {
    for (const objectUrl of this.objectUrls.values()) {
      URL.revokeObjectURL(objectUrl);
    }
    this.objectUrls.clear();
    await tx('readwrite', (store) => store.clear());
  }
}
