import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../api/portal.api';
import { FACULTY_MEMBERS, type FacultyMember } from '../constants/faculty.constant';
import { persisted, type PersistedStore } from './persisted-store';

const KEY = 'pc-personal';

@Injectable({ providedIn: 'root' })
export class FacultyStore {
  private readonly api = inject(PortalApi);
  private readonly store: PersistedStore<FacultyMember[]> = persisted(KEY, [...FACULTY_MEMBERS]);

  readonly lista = this.store.value;
  readonly modificado = this.store.modificado;

  async hidratar(): Promise<void> {
    if (!environment.useRemoteApi) return;
    try {
      this.store.set(await this.api.personal());
    } catch {
      // Se conserva el directorio local.
    }
  }

  async crear(
    data: Omit<FacultyMember, 'id' | 'order'> & { order?: number },
  ): Promise<FacultyMember> {
    const maxId = this.lista().reduce((n, m) => Math.max(n, m.id), 0);
    const maxOrden = this.lista().reduce((n, m) => Math.max(n, m.order), 0);
    let created: FacultyMember = {
      ...data,
      id: maxId + 1,
      order: data.order ?? maxOrden + 1,
    };
    if (environment.useRemoteApi) {
      created = await this.api.crearPersonal(created);
    }
    this.store.set([...this.lista(), created]);
    return created;
  }

  async actualizar(member: FacultyMember): Promise<void> {
    if (environment.useRemoteApi) {
      await this.api.actualizarPersonal(member);
    }
    this.store.set(this.lista().map((item) => (item.id === member.id ? member : item)));
  }

  async eliminar(id: number): Promise<void> {
    if (environment.useRemoteApi) {
      await this.api.eliminarPersonal(id);
    }
    this.store.set(this.lista().filter((item) => item.id !== id));
  }

  reset(): void {
    this.store.reset();
  }
}
