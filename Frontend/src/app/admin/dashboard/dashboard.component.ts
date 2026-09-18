import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortalApi } from '../../core/api/portal.api';
import { AuthService } from '../../core/auth/auth.service';
import type { PanelResumen } from '../../core/api/api.types';

interface BandejaMeta {
  label: string;
  ruta: string;
  /** Tiene plazo de respuesta fijado por ley: se muestra y se ordena primero. */
  regulado: boolean;
  nota?: string;
}

/** Las cinco bandejas que llegan por el portal. `regulado` marca las que corren
 *  contra un plazo legal; el orden del tablero las pone arriba. */
const BANDEJAS: Record<string, BandejaMeta> = {
  'mesa-de-partes': {
    label: 'Mesa de partes',
    ruta: '/admin/mesa-de-partes',
    regulado: false,
  },
  reclamaciones: {
    label: 'Libro de reclamaciones',
    ruta: '/admin/reclamaciones',
    regulado: true,
    nota: 'Respuesta máx. 30 días calendario',
  },
  'acceso-informacion': {
    label: 'Acceso a la información',
    ruta: '/admin/solicitudes',
    regulado: true,
    nota: 'Respuesta con plazo de ley',
  },
  'citas-psicopedagogicas': {
    label: 'Citas psicopedagógicas',
    ruta: '/admin/solicitudes',
    regulado: false,
  },
  'servicio-social': {
    label: 'Servicio social',
    ruta: '/admin/solicitudes',
    regulado: false,
  },
};

const ETIQUETA_ACCION: Record<string, string> = {
  crear: 'creó',
  actualizar: 'actualizó',
  eliminar: 'eliminó',
  publicar: 'publicó',
  restaurar: 'restauró',
  login: 'inició sesión en',
  logout: 'cerró sesión en',
};

interface BandejaVista extends BandejaMeta {
  clave: string;
  total: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private readonly api = inject(PortalApi);
  private readonly auth = inject(AuthService);

  readonly usuario = this.auth.usuario;
  readonly esAdmin = this.auth.esAdmin;

  readonly resumen = signal<PanelResumen | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  /** Momento de la última respuesta correcta del API. */
  readonly actualizadoEn = signal<Date | null>(null);

  /** Se refresca cada 30 s para que "hace X" no mienta sin recargar la página. */
  private readonly ahora = signal(Date.now());

  /** Primera carga: aún no hay nada que mostrar, va el esqueleto. */
  readonly primeraCarga = computed(() => this.cargando() && !this.resumen());
  /** Recarga con datos ya en pantalla: se atenúa, no se vacía. */
  readonly refrescando = computed(() => this.cargando() && !!this.resumen());

  readonly bandejas = computed<BandejaVista[]>(() => {
    const pendientes = this.resumen()?.tramitesPendientes ?? {};
    return Object.entries(pendientes).map(([clave, total]) => {
      const meta = BANDEJAS[clave] ?? {
        label: clave,
        ruta: '/admin/solicitudes',
        regulado: false,
      };
      return { ...meta, clave, total: Number(total) || 0 };
    });
  });

  /** Con pendientes: reguladas primero, luego por volumen. */
  readonly pendientes = computed(() =>
    this.bandejas()
      .filter((b) => b.total > 0)
      .sort((a, b) => Number(b.regulado) - Number(a.regulado) || b.total - a.total),
  );

  readonly alDia = computed(() => this.bandejas().filter((b) => b.total === 0));

  readonly totalPendientes = computed(() =>
    this.pendientes().reduce((suma, b) => suma + b.total, 0),
  );

  /** Alguna bandeja regulada tiene cola: el bloque entero sube de tono. */
  readonly hayUrgencia = computed(() => this.pendientes().some((b) => b.regulado));

  readonly relativa = computed(() => {
    const fecha = this.actualizadoEn();
    if (!fecha) return '';
    const segundos = Math.round((this.ahora() - fecha.getTime()) / 1000);
    if (segundos < 45) return 'hace un momento';
    if (segundos < 90) return 'hace 1 min';
    const minutos = Math.round(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.round(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;
    return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    const tick = setInterval(() => this.ahora.set(Date.now()), 30_000);
    destroyRef.onDestroy(() => clearInterval(tick));

    // Optimización: no bloquear la carga inicial con la sesión
    void this.auth.refrescarSesion();
    
    // Cargar datos del dashboard con un pequeño delay para no bloquear renderizado
    setTimeout(() => void this.cargar(), 100);
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      // Timeout de 10 segundos para evitar bloqueos largos
      const resumenPromise = this.api.resumenPanel();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      this.resumen.set(await Promise.race([resumenPromise, timeoutPromise]) as PanelResumen);
      this.actualizadoEn.set(new Date());
      this.ahora.set(Date.now());
    } catch {
      this.error.set('No se pudo leer el resumen. Revise que el API esté en ejecución.');
    } finally {
      this.cargando.set(false);
    }
  }

  accion(accion: string): string {
    return ETIQUETA_ACCION[accion] ?? accion;
  }


  descripcionEvento(evento: PanelResumen['actividad'][number]): string {
    const entidad = (evento.entidad ?? '').toLowerCase();
    const accion = (evento.accion ?? '').toLowerCase();

    if (entidad === 'auth') {
      if (accion === 'login') {
        return 'Inició sesión en el panel administrativo';
      }

      if (accion === 'logout') {
        return 'Cerró sesión del panel administrativo';
      }
    }

    if (entidad === 'tramites:accesibilidad') {
      if (accion === 'crear') {
        return 'Registró un reporte de accesibilidad';
      }

      if (accion === 'actualizar') {
        return 'Actualizó un reporte de accesibilidad';
      }

      if (accion === 'eliminar') {
        return 'Eliminó un reporte de accesibilidad';
      }
    }

    return `${this.accion(evento.accion)} ${evento.entidad}`;
  }
  fecha(iso: string): string {
    return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
  }

  claveEvento(evento: PanelResumen['actividad'][number]): string {
    return `${evento.fecha}|${evento.entidad}|${evento.entidadId ?? ''}|${evento.accion}`;
  }

  /** El id de la entidad suele ser un UUID: se recorta y el valor entero va en el title. */
  idCorto(id: string): string {
    return id.length > 12 ? `${id.slice(0, 8)}…` : id;
  }

  /** "1 solicitud" / "3 solicitudes" — sin el paréntesis de "solicitud(es)". */
  plural(n: number, singular: string, plural: string): string {
    return `${n} ${n === 1 ? singular : plural}`;
  }

  listaAlDia(): string {
    const nombres = this.alDia().map((b) => b.label);
    if (nombres.length <= 1) return nombres.join('');
    return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
  }
}

