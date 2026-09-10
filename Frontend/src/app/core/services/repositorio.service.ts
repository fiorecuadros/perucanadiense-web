import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../api/portal.api';
import { REPOSITORIO_ITEMS, type TesisItem } from '../constants/repositorio.constant';

@Injectable({ providedIn: 'root' })
export class RepositorioService {
  private readonly api = inject(PortalApi);
  private readonly items = signal<readonly TesisItem[]>(REPOSITORIO_ITEMS);

  readonly all = this.items.asReadonly();
  readonly programas = computed(() => [
    'todos',
    ...new Set(this.items().map((item) => item.programa)),
  ]);
  readonly anios = computed(() => [
    'todos',
    ...[...new Set(this.items().map((item) => item.anio))].sort(),
  ]);

  async hidratar(): Promise<void> {
    if (!environment.useRemoteApi) return;
    try {
      this.items.set(await this.api.repositorio());
    } catch {
      // Se conservan las tesis del constante.
    }
  }

  porId(id: string): TesisItem | undefined {
    return this.items().find((item) => item.id === id);
  }

  relacionados(id: string): TesisItem[] {
    const actual = this.porId(id);
    if (!actual) return [];
    return this.items().filter((item) => item.programa === actual.programa && item.id !== id);
  }

  async crear(datos: Omit<TesisItem, 'id'> & { id?: string }): Promise<TesisItem> {
    const creada = await this.api.crearTesis(datos);
    this.items.set([...this.items(), creada]);
    return creada;
  }

  async actualizar(tesis: TesisItem): Promise<TesisItem> {
    const guardada = await this.api.actualizarTesis(tesis);
    this.items.set(this.items().map((item) => (item.id === guardada.id ? guardada : item)));
    return guardada;
  }

  async eliminar(id: string): Promise<void> {
    await this.api.eliminarTesis(id);
    this.items.set(this.items().filter((item) => item.id !== id));
  }

  /** Sube el PDF de la tesis; el API lo enlaza y devuelve la ficha con `pdfUrl`. */
  async subirArchivo(id: string, file: File): Promise<TesisItem> {
    const guardada = await this.api.subirArchivoTesis(id, file);
    this.items.set(this.items().map((item) => (item.id === guardada.id ? guardada : item)));
    return guardada;
  }
}
