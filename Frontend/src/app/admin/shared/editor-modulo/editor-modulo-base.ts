import { computed, Directive, effect, inject, type Signal, signal, untracked } from '@angular/core';
import { ContenidoStore } from '../../../core/store/contenido.store';
import type { ContentByModulo } from '../../../core/store/contenido.store';
import type { ModuloId } from '../../../core/models/documento.model';
import { getPath, setPath } from '../../../core/store/object-path';
import type { PuedeSalirConCambios } from '../aviso-cambios/salir-con-cambios';
import { ToastService } from '../toast/toast';

export interface ConfirmacionEditor {
  titulo: string;
  detalle: string;
  accion: () => void;
}

/** Grupo de imagen dentro de un esquema: la ruta y su texto alternativo. */
export interface GrupoImagen {
  srcKey: string;
  altKey: string;
  label: string;
}

/**
 * Lo que `EditorEsquema` necesita del editor: leer y escribir campos por ruta
 * ("cover.src") y pedir confirmación para quitar una imagen.
 */
export interface EditorEsquemaHost {
  leerCampo(key: string): string;
  escribirCampo(key: string, valor: unknown): void;
  quitarImagen(grupo: GrupoImagen): void;
}

/**
 * Cara no genérica de un editor de módulo, la que consume `EditorModuloMarco`.
 * Evita arrastrar el parámetro de tipo del contenido a la vista.
 */
export interface EditorModuloVista {
  readonly modificado: Signal<boolean>;
  readonly guardando: Signal<boolean>;
  readonly guardado: Signal<boolean>;
  readonly restaurando: Signal<boolean>;
  readonly aviso: Signal<boolean>;
  readonly confirmacion: Signal<ConfirmacionEditor | null>;
  dirty(): boolean;
  guardar(): Promise<void>;
  cancelar(): void;
  restaurar(): Promise<void>;
  ejecutarConfirmacion(): void;
  cancelarConfirmacion(): void;
  onGuardarAviso(): Promise<void>;
  onDescartarAviso(): void;
  onSeguirAviso(): void;
}

/**
 * Lógica compartida por los editores de módulo a medida (Inicio, Nosotros, …):
 * borrador en memoria, estado dirty, guardado con feedback, restaurar original,
 * aviso de salida y diálogo de confirmación de borrado. La vista la pone cada
 * módulo con `<app-editor-modulo-marco>`.
 */
@Directive()
export abstract class EditorModuloBase<K extends ModuloId>
  implements PuedeSalirConCambios, EditorModuloVista, EditorEsquemaHost
{
  protected readonly contenido = inject(ContenidoStore);
  protected readonly toast = inject(ToastService);

  /** Identificador del módulo en el store / API. */
  protected abstract readonly moduloId: K;
  /** Mensaje de éxito al guardar. */
  protected mensajeGuardado = 'Los cambios ya están publicados en el portal.';

  readonly draft = signal<ContentByModulo[K]>({} as ContentByModulo[K]);
  readonly guardando = signal(false);
  readonly guardado = signal(false);
  readonly restaurando = signal(false);
  readonly aviso = signal(false);
  readonly confirmacion = signal<ConfirmacionEditor | null>(null);

  readonly modificado = computed(() => this.contenido.de(this.moduloId).modificado());

  protected snapshot = '';
  private cargadoUnaVez = false;
  private resolverAviso: ((salir: boolean) => void) | null = null;

  constructor() {
    effect(() => {
      const value = this.contenido.de(this.moduloId).value();
      untracked(() => {
        if (!this.cargadoUnaVez) {
          this.cargar(value);
          this.cargadoUnaVez = true;
          return;
        }
        if (!this.dirty()) {
          this.cargar(value);
        }
      });
    });
  }

  dirty(): boolean {
    return JSON.stringify(this.draft()) !== this.snapshot;
  }

  confirmarSalida(): Promise<boolean> {
    this.aviso.set(true);
    return new Promise((resolve) => {
      this.resolverAviso = resolve;
    });
  }

  /** Fusiona un cambio parcial en el borrador. */
  parche(cambio: Partial<ContentByModulo[K]>): void {
    this.draft.update((actual) => ({ ...actual, ...cambio }));
    this.guardado.set(false);
  }

  /** Lee un campo del borrador por ruta ("cover.src") como texto. */
  leerCampo(key: string): string {
    const valor = getPath(this.draft(), key);
    return valor === undefined || valor === null ? '' : String(valor);
  }

  /** Escribe un campo del borrador por ruta. */
  escribirCampo(key: string, valor: unknown): void {
    this.draft.set(setPath(this.draft(), key, valor) as ContentByModulo[K]);
    this.guardado.set(false);
  }

  /** Pide confirmación y, al aceptar, vacía la ruta y el texto alternativo. */
  quitarImagen(grupo: GrupoImagen): void {
    this.pedirConfirmacion({
      titulo: `Quitar ${grupo.label.toLowerCase()}`,
      detalle: 'La sección quedará sin esta imagen hasta que suba una nueva.',
      accion: () => {
        this.escribirCampo(grupo.srcKey, '');
        this.escribirCampo(grupo.altKey, '');
      },
    });
  }

  async guardar(): Promise<void> {
    if (!this.dirty() || this.guardando()) return;
    this.guardando.set(true);
    try {
      await this.contenido.publicar(this.moduloId, structuredClone(this.draft()));
      this.snapshot = JSON.stringify(this.draft());
      this.guardado.set(true);
      this.toast.success(this.mensajeGuardado);
    } catch {
      this.toast.error(
        'No se pudieron guardar los cambios. Revise la conexión e intente de nuevo.',
      );
    } finally {
      this.guardando.set(false);
    }
  }

  cancelar(): void {
    this.cargar(this.contenido.de(this.moduloId).value());
    this.guardado.set(false);
  }

  async restaurar(): Promise<void> {
    this.restaurando.set(true);
    try {
      await this.contenido.restaurar(this.moduloId);
      this.cargar(this.contenido.de(this.moduloId).value());
      this.guardado.set(false);
      this.toast.success('Se restauró el contenido original de este módulo.');
    } catch {
      this.toast.error('No se pudo restaurar el contenido original.');
    } finally {
      this.restaurando.set(false);
    }
  }

  /** Abre el diálogo de confirmación de borrado. */
  pedirConfirmacion(confirmacion: ConfirmacionEditor): void {
    this.confirmacion.set(confirmacion);
  }

  ejecutarConfirmacion(): void {
    const pendiente = this.confirmacion();
    if (!pendiente) return;
    pendiente.accion();
    this.confirmacion.set(null);
  }

  cancelarConfirmacion(): void {
    this.confirmacion.set(null);
  }

  async onGuardarAviso(): Promise<void> {
    await this.guardar();
    this.cerrarAviso(!this.dirty());
  }

  onDescartarAviso(): void {
    this.cerrarAviso(true);
  }

  onSeguirAviso(): void {
    this.cerrarAviso(false);
  }

  private cargar(value: ContentByModulo[K]): void {
    const clon = structuredClone(value);
    this.draft.set(clon);
    this.snapshot = JSON.stringify(clon);
  }

  private cerrarAviso(salir: boolean): void {
    this.aviso.set(false);
    this.resolverAviso?.(salir);
    this.resolverAviso = null;
  }
}
