import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../api/portal.api';
import {
  NAVIGATION,
  esDestinoExterno,
  menuDeZona,
  type MenuItem,
  type MenuZona,
} from '../constants/navigation.constant';

/**
 * El menú de navegación del portal.
 *
 * Arranca con la constante y la sustituye por lo que devuelva el API. Si el API
 * no responde, o devuelve una zona vacía, se conserva lo que ya había: una
 * cabecera sin enlaces deja el portal inservible, y eso no puede depender de que
 * la red vaya bien.
 */
@Injectable({ providedIn: 'root' })
export class MenuStore {
  private readonly api = inject(PortalApi);

  private readonly items = signal<MenuItem[]>(NAVIGATION);

  readonly principal = computed(() => menuDeZona(this.items(), 'principal'));
  readonly acciones = computed(() => menuDeZona(this.items(), 'acciones'));
  readonly pieInstitucional = computed(() => menuDeZona(this.items(), 'pie-institucional'));
  readonly pieServicios = computed(() => menuDeZona(this.items(), 'pie-servicios'));

  /** Un destino fuera del portal se abre en otra pestaña. */
  esExterno = esDestinoExterno;

  async hidratar(): Promise<void> {
    if (!environment.useRemoteApi) return;
    try {
      this.aplicarPorZonas(await this.api.menu());
    } catch {
      // Se sigue con la constante: el portal nunca se queda sin navegación.
    }
  }

  /**
   * El API agrupa por zona. Una zona ausente conserva lo que ya había, así que
   * añadir una zona nueva en el frontend no obliga a tocar el servidor primero.
   */
  private aplicarPorZonas(zonas: Partial<Record<MenuZona, MenuItem[]>>): void {
    if (!zonas || typeof zonas !== 'object') return;
    const conDatos = Object.entries(zonas).filter(([, items]) => Array.isArray(items) && items.length);
    if (!conDatos.length) return;

    const reemplazadas = new Set(conDatos.map(([zona]) => zona));
    this.items.set([
      ...this.items().filter((item) => !reemplazadas.has(item.zona)),
      ...conDatos.flatMap(([, items]) => items as MenuItem[]),
    ]);
  }

  /** Aplica en caliente lo que el panel acaba de guardar, sin recargar. */
  aplicar(items: MenuItem[]): void {
    if (Array.isArray(items) && items.length) this.items.set(items);
  }
}
