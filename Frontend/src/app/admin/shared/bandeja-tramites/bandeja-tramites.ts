import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PortalApi } from '../../../core/api/portal.api';
import { DialogComponent } from '../../../shared/ui';
import { ToastService } from '../toast/toast';
import type { TramiteAdmin, TramiteCambioEstado } from '../../../core/api/api.types';

export interface ColumnaBandeja {
  label: string;
  campo: string;
}

/**
 * Bandeja de un trámite ciudadano. Mesa de partes, libro de reclamaciones,
 * acceso a la información, citas y apoyo social comparten la misma mecánica
 * (listar, filtrar por estado, abrir el detalle, responder y cambiar el estado):
 * cambian las columnas y los estados, no el comportamiento.
 */
@Component({
  selector: 'app-bandeja-tramites',
  standalone: true,
  imports: [DialogComponent],
  templateUrl: './bandeja-tramites.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BandejaTramites {
  private readonly toast = inject(ToastService);
  private readonly api = inject(PortalApi);

  readonly titulo = input.required<string>();
  readonly descripcion = input('');
  readonly columnas = input.required<ColumnaBandeja[]>();
  readonly detalle = input.required<ColumnaBandeja[]>();
  readonly estados = input.required<string[]>();
  readonly etiquetaRespuesta = input('Respuesta / observación');
  /** Clave del payload con el correo del solicitante. '' = bandeja sin aviso. */
  readonly campoCorreo = input('email');
  readonly soloLectura = input(false);
  readonly cargar = input.required<() => Promise<TramiteAdmin[]>>();
  readonly guardar = input<
    ((id: string, cambio: TramiteCambioEstado) => Promise<TramiteAdmin>) | null
  >(null);

  readonly items = signal<TramiteAdmin[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly filtro = signal('todos');
  readonly abierto = signal<TramiteAdmin | null>(null);
  readonly estadoEditado = signal('');
  readonly respuestaEditada = signal('');
  readonly notificar = signal(false);
  readonly guardando = signal(false);

  readonly visibles = computed(() => {
    const estado = this.filtro();
    return estado === 'todos' ? this.items() : this.items().filter((t) => t.estado === estado);
  });

  readonly pendientes = computed(
    () => this.items().filter((t) => t.estado === 'pendiente' || t.estado === 'recibido').length,
  );

  constructor() {
    // Se recarga sola cuando cambia el origen de datos: la pantalla de
    // solicitudes reutiliza esta misma bandeja para sus tres pestañas.
    effect(() => {
      const cargar = this.cargar();
      this.abierto.set(null);
      this.filtro.set('todos');
      void this.traer(cargar);
    });
  }

  recargar(): Promise<void> {
    return this.traer(this.cargar());
  }

  private async traer(cargar: () => Promise<TramiteAdmin[]>): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.items.set(await cargar());
    } catch {
      this.error.set('No se pudo cargar la bandeja. ¿Está el servidor levantado?');
    } finally {
      this.cargando.set(false);
    }
  }

  abrir(tramite: TramiteAdmin): void {
    this.abierto.set(tramite);
    this.estadoEditado.set(tramite.estado);
    this.respuestaEditada.set(tramite.respuesta ?? '');
    // Nunca marcada por defecto: avisar al ciudadano se elige, no se hereda de
    // la solicitud anterior que se estuvo mirando.
    this.notificar.set(false);
  }

  /** Correo del solicitante, o '' si no dejó uno. */
  correoDe(tramite: TramiteAdmin): string {
    const campo = this.campoCorreo();
    const valor = campo ? tramite.payload[campo] : undefined;
    return valor ? String(valor) : '';
  }

  valor(tramite: TramiteAdmin, campo: string): string {
    if (campo === 'codigo') return tramite.codigo;
    if (campo === 'estado') return this.etiquetaEstado(tramite.estado);
    if (campo === 'fecha') return this.fecha(tramite.submittedAt);
    const dato = tramite.payload[campo];
    return dato === undefined || dato === null ? '—' : String(dato);
  }

  /** Un adjunto o un enlace del solicitante se abre, no se lee como texto. */
  esEnlace(valor: string): boolean {
    return valor.startsWith('http://') || valor.startsWith('https://') || valor.startsWith('/api/');
  }

  urlAbsoluta(valor: string): string {
    return valor.startsWith('/api/') ? `${environment.baseUrl}${valor}` : valor;
  }

  /** Un enlace que escribió el solicitante sale del portal: se abre tal cual. */
  esArchivoDelApi(valor: string): boolean {
    return valor.startsWith('/api/');
  }

  /**
   * Abre un adjunto reservado. El API lo niega sin sesión y un `<a href>` no
   * lleva el token, así que se baja por HttpClient (el interceptor lo firma) y
   * se abre el blob resultante.
   */
  async abrirAdjunto(url: string): Promise<void> {
    try {
      const blob = await this.api.descargarArchivo(url);
      const objeto = URL.createObjectURL(blob);
      const ventana = window.open(objeto, '_blank', 'noopener');
      if (!ventana) {
        // Bloqueador de ventanas: al menos que se lo pueda guardar.
        const enlace = document.createElement('a');
        enlace.href = objeto;
        enlace.download = url.split('/').pop() || 'adjunto';
        enlace.click();
      }
      // El blob vive en memoria hasta que se revoque; la pestaña ya lo tiene.
      setTimeout(() => URL.revokeObjectURL(objeto), 60_000);
    } catch {
      this.toast.error('No se pudo abrir el adjunto.');
    }
  }

  etiquetaEstado(estado: string): string {
    return estado.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  }

  claseEstado(estado: string): string {
    const atendido = ['finalizado', 'resuelto', 'atendida', 'confirmada', 'cerrada'];
    return atendido.includes(estado) ? 'badge badge-publicado' : 'badge badge-borrador';
  }

  fecha(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
  }

  async aplicar(): Promise<void> {
    const tramite = this.abierto();
    const guardar = this.guardar();
    if (!tramite || !guardar) return;
    this.guardando.set(true);
    try {
      const avisar = this.notificar() && !!this.correoDe(tramite);
      const actualizado = await guardar(tramite.id, {
        estado: this.estadoEditado(),
        respuesta: this.respuestaEditada().trim() || undefined,
        notificar: avisar,
      });
      this.items.update((lista) => lista.map((t) => (t.id === actualizado.id ? actualizado : t)));
      this.abierto.set(null);
      // Si se pidió avisar y el correo no salió (SMTP caído), decirlo: el
      // expediente quedó guardado igual, pero nadie avisó al ciudadano.
      if (avisar && !actualizado.notificado) {
        this.toast.error('Se guardó el trámite, pero no se pudo enviar el correo al solicitante.');
      } else {
        this.toast.success(avisar ? 'Trámite actualizado y solicitante notificado.' : 'Trámite actualizado.');
      }
    } catch {
      this.toast.error('No se pudo actualizar el trámite.');
    } finally {
      this.guardando.set(false);
    }
  }
}
