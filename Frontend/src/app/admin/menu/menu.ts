import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PortalApi } from '../../core/api/portal.api';
import { MenuStore } from '../../core/store/menu.store';
import {
  MENU_ZONAS,
  type MenuItem,
  type MenuZona,
} from '../../core/constants/navigation.constant';
import { DialogComponent } from '../../shared/ui';
import { ToastService } from '../shared/toast/toast';

type Borrador = Omit<MenuItem, 'id'> & { id?: string };

const nuevoBorrador = (zona: MenuZona): Borrador => ({
  zona,
  etiqueta: '',
  destino: '',
  orden: 0,
  visible: true,
});

/**
 * Menú de navegación del portal: cabecera, botones destacados y las dos columnas
 * del pie. Antes estaban escritos en el HTML, así que añadir una página al menú
 * exigía un programador y un despliegue.
 */
@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [DialogComponent],
  templateUrl: './menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMenu {
  private readonly api = inject(PortalApi);
  private readonly store = inject(MenuStore);
  private readonly toast = inject(ToastService);

  readonly zonas = MENU_ZONAS;

  readonly items = signal<MenuItem[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly guardando = signal(false);

  readonly formAbierto = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly form = signal<Borrador>(nuevoBorrador('principal'));

  /** Los enlaces de cada zona, en su orden, incluidos los ocultos. */
  readonly porZona = computed(() => {
    const mapa = {} as Record<MenuZona, MenuItem[]>;
    for (const zona of MENU_ZONAS) {
      mapa[zona.id] = this.items()
        .filter((i) => i.zona === zona.id)
        .sort((a, b) => a.orden - b.orden);
    }
    return mapa;
  });

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.items.set(await this.api.menuAdmin());
    } catch {
      this.error.set('No se pudo cargar el menú. ¿Está el servidor levantado?');
    } finally {
      this.cargando.set(false);
    }
  }

  // ------------------------------------------------------------------ formulario
  abrirNuevo(zona: MenuZona): void {
    this.editandoId.set(null);
    this.form.set(nuevoBorrador(zona));
    this.formAbierto.set(true);
  }

  abrirEdicion(item: MenuItem): void {
    this.editandoId.set(item.id);
    this.form.set({ ...item });
    this.formAbierto.set(true);
  }

  parche<K extends keyof Borrador>(campo: K, valor: Borrador[K]): void {
    this.form.update((f) => ({ ...f, [campo]: valor }));
  }

  readonly puedeGuardar = computed(() => {
    const f = this.form();
    return (
      f.etiqueta.trim().length > 0 &&
      (f.destino.trim().startsWith('/') || /^https?:\/\//i.test(f.destino.trim()))
    );
  });

  async guardar(): Promise<void> {
    if (!this.puedeGuardar()) return;
    const f = this.form();
    const cuerpo = {
      zona: f.zona,
      etiqueta: f.etiqueta.trim(),
      destino: f.destino.trim(),
      variante: f.variante || undefined,
      orden: f.orden,
      visible: f.visible,
    };

    this.guardando.set(true);
    try {
      const id = this.editandoId();
      if (id) {
        const actualizado = await this.api.actualizarMenuItem(id, cuerpo);
        this.items.update((l) => l.map((i) => (i.id === id ? actualizado : i)));
      } else {
        const creado = await this.api.crearMenuItem(cuerpo);
        this.items.update((l) => [...l, creado]);
      }
      this.formAbierto.set(false);
      this.propagar();
      this.toast.success('Menú actualizado.');
    } catch (error: unknown) {
      this.toast.error(this.mensajeDe(error, 'No se pudo guardar el enlace.'));
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminar(item: MenuItem): Promise<void> {
    try {
      await this.api.borrarMenuItem(item.id);
      this.items.update((l) => l.filter((i) => i.id !== item.id));
      this.propagar();
      this.toast.success(`"${item.etiqueta}" se quitó del menú.`);
    } catch {
      this.toast.error('No se pudo eliminar el enlace.');
    }
  }

  /** Ocultar en vez de borrar: reponerlo luego no obliga a escribirlo de nuevo. */
  async alternarVisible(item: MenuItem): Promise<void> {
    try {
      const actualizado = await this.api.actualizarMenuItem(item.id, {
        ...item,
        visible: !item.visible,
      });
      this.items.update((l) => l.map((i) => (i.id === item.id ? actualizado : i)));
      this.propagar();
    } catch {
      this.toast.error('No se pudo cambiar la visibilidad.');
    }
  }

  // --------------------------------------------------------------------- orden
  /**
   * Mover un enlace reordena su zona entera y se manda de una vez: si se
   * enviara enlace por enlace, un fallo a mitad dejaría el menú desordenado.
   */
  async mover(item: MenuItem, direccion: -1 | 1): Promise<void> {
    const zona = this.porZona()[item.zona];
    const desde = zona.findIndex((i) => i.id === item.id);
    const hasta = desde + direccion;
    if (desde < 0 || hasta < 0 || hasta >= zona.length) return;

    const reordenada = [...zona];
    [reordenada[desde], reordenada[hasta]] = [reordenada[hasta], reordenada[desde]];
    const cambios = reordenada.map((i, indice) => ({ id: i.id, orden: indice + 1 }));

    try {
      this.items.set(await this.api.ordenarMenu(cambios));
      this.propagar();
    } catch {
      this.toast.error('No se pudo reordenar.');
    }
  }

  async restaurar(): Promise<void> {
    try {
      this.items.set(await this.api.restaurarMenu());
      this.propagar();
      this.toast.success('Se repuso el menú original.');
    } catch (error: unknown) {
      this.toast.error(this.mensajeDe(error, 'No se pudo restaurar el menú.'));
    }
  }

  // ------------------------------------------------------------------ auxiliares
  /** El portal comparte el store: el cambio se ve sin recargar. */
  private propagar(): void {
    this.store.aplicar(this.items());
  }

  private mensajeDe(error: unknown, porDefecto: string): string {
    const e = error as { error?: { message?: string; detalles?: { mensaje: string }[] } };
    return e.error?.detalles?.[0]?.mensaje || e.error?.message || porDefecto;
  }

  esExterno(destino: string): boolean {
    return /^https?:\/\//i.test(destino);
  }

  labelZona(zona: MenuZona): string {
    return MENU_ZONAS.find((z) => z.id === zona)?.label ?? zona;
  }
}
