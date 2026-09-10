import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { PortalApi } from '../../../core/api/portal.api';
import type { ContenidoVersion } from '../../../core/api/api.types';
import { ContenidoStore } from '../../../core/store/contenido.store';
import { DocumentosStore } from '../../../core/store/documentos.store';
import type { ModuloId } from '../../../core/models/documento.model';
import { AvisoCambios } from '../aviso-cambios/aviso-cambios';
import type { PuedeSalirConCambios } from '../aviso-cambios/salir-con-cambios';
import { EditorContenido } from '../editor-contenido/editor-contenido';
import type { CampoSchema } from '../editor-contenido/schema';
import { TablaDocumentos } from '../tabla-documentos/tabla-documentos';
import { ToastService } from '../toast/toast';
import { DialogComponent } from '../../../shared/ui';

@Component({
  selector: 'app-modulo-editor',
  standalone: true,
  imports: [RouterLink, AvisoCambios, EditorContenido, TablaDocumentos, DialogComponent],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ titulo() }}</h1>
          <p class="page-sub">
            Los cambios se publican en el portal. Con el API remoto se envían al módulo de
            contenido.
          </p>
        </div>
        <div class="page-header-actions">
          @if (modificado()) {
            <span class="badge badge-modificado">Modificado</span>
          }
          <a class="btn-ghost" [routerLink]="publicPath()" target="_blank" rel="noopener">
            Ver página pública
          </a>
          @if (remoto) {
            <button type="button" class="btn-ghost" (click)="abrirHistorial()">Historial</button>
          }
          <button type="button" class="btn-ghost" (click)="restaurar()">Restaurar original</button>
        </div>
      </header>

      <nav class="admin-tabs" [attr.aria-label]="'Secciones de ' + titulo()">
        @for (tab of tabs(); track tab.id) {
          <button
            type="button"
            class="admin-tab"
            [class.active]="active() === tab.id"
            [attr.aria-current]="active() === tab.id ? 'true' : null"
            (click)="active.set(tab.id)"
          >
            {{ tab.label }}
          </button>
        }
      </nav>

      <div class="admin-card seccion-card">
        <header class="seccion-head">
          <h2 class="seccion-titulo">{{ tabActivaLabel() }}</h2>
          <p class="seccion-sub">
            @if (campos().length) {
              {{ campos().length }} {{ campos().length === 1 ? 'campo' : 'campos' }} en esta sección
              · los cambios se guardan al pulsar «Guardar».
            } @else {
              Esta sección no tiene campos de texto; use «Documentos de esta sección».
            }
          </p>
        </header>
        @if (campos().length) {
          <div class="admin-card-body seccion-cuerpo">
            <app-editor-contenido
              [schema]="campos()"
              [valor]="draft()"
              (valorChange)="draft.set($event)"
            />
          </div>
        }
      </div>

      @if (mostrarDocumentos()) {
        <div class="seccion-docs">
          <app-tabla-documentos [modulo]="modulo()" [seccion]="active()" />
        </div>
      }

      <div class="save-bar">
        <button type="button" class="btn-cancel" (click)="cancelar()" [disabled]="!dirty()">
          Cancelar
        </button>
        <button type="button" class="btn-save" (click)="guardar()" [disabled]="!dirty()">
          Guardar
        </button>
      </div>
    </div>

    <app-aviso-cambios
      [abierto]="aviso()"
      (guardar)="onGuardarAviso()"
      (descartar)="onDescartarAviso()"
      (seguir)="onSeguirAviso()"
    />

    <app-dialog
      [open]="historialAbierto()"
      title="Historial de versiones"
      (openChange)="historialAbierto.set($event)"
    >
      @if (historialCargando()) {
        <p class="form-hint">Cargando versiones…</p>
      } @else if (versiones().length === 0) {
        <p>Aún no hay versiones archivadas. Se crean cada vez que guarda.</p>
      } @else {
        <div class="historial-lista">
          @for (v of versiones(); track v.id) {
            <button
              type="button"
              class="historial-item"
              [class.active]="versionActiva()?.id === v.id"
              (click)="verVersion(v)"
            >
              <span>{{ v.autor }} · {{ fechaCorta(v.fecha) }}</span>
              <span class="form-hint">#{{ v.id }}</span>
            </button>
          }
        </div>
        @if (versionActiva(); as ver) {
          <pre class="historial-json">{{ previewJson() }}</pre>
          <div dialog-footer>
            <button type="button" class="btn-cancel" (click)="historialAbierto.set(false)">
              Cerrar
            </button>
            <button
              type="button"
              class="btn-save"
              [disabled]="restaurandoVersion()"
              (click)="restaurarVersion()"
            >
              {{ restaurandoVersion() ? 'Restaurando…' : 'Volver a esta versión' }}
            </button>
          </div>
        }
      }
    </app-dialog>
  `,
  styles: `
    :host {
      display: block;
    }

    .seccion-card {
      overflow: visible;
    }

    .seccion-head {
      padding: 16px 22px;
      border-bottom: 1px solid var(--adm-line);
      background: linear-gradient(180deg, var(--adm-bg), var(--adm-surface));
    }

    .seccion-titulo {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--adm-ink);
      letter-spacing: -0.01em;
    }

    .seccion-sub {
      margin: 3px 0 0;
      font-size: 0.78rem;
      color: var(--adm-ink-soft);
    }

    .seccion-cuerpo {
      padding: 20px 22px 24px;
      background: var(--adm-bg);
    }

    .seccion-docs {
      margin-top: 22px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuloEditor implements PuedeSalirConCambios {
  private readonly contenido = inject(ContenidoStore);
  private readonly documentos = inject(DocumentosStore);
  private readonly toast = inject(ToastService);
  private readonly api = inject(PortalApi);

  readonly modulo = input.required<ModuloId>();
  readonly titulo = input.required<string>();
  readonly publicPath = input.required<string>();
  readonly schema = input.required<CampoSchema[]>();
  readonly tabs = input.required<readonly { id: string; label: string }[]>();
  readonly mostrarDocumentos = input(true);

  readonly remoto = environment.useRemoteApi;
  readonly draft = signal<unknown>({});
  readonly active = signal('');
  readonly aviso = signal(false);
  readonly historialAbierto = signal(false);
  readonly historialCargando = signal(false);
  readonly versiones = signal<ContenidoVersion[]>([]);
  readonly versionActiva = signal<ContenidoVersion | null>(null);
  readonly restaurandoVersion = signal(false);

  private snapshot = '';
  private loadedFor: ModuloId | null = null;
  private resolverAviso: ((value: boolean) => void) | null = null;

  readonly campos = computed(() => this.schema().filter((c) => c.seccion === this.active()));
  readonly tabActivaLabel = computed(
    () => this.tabs().find((t) => t.id === this.active())?.label ?? this.titulo(),
  );
  readonly modificado = computed(() => this.contenido.de(this.modulo()).modificado());
  readonly previewJson = computed(() => {
    const data = this.versionActiva()?.data;
    return data ? JSON.stringify(data, null, 2) : '';
  });

  constructor() {
    effect(() => {
      const modulo = this.modulo();
      const value = this.contenido.de(modulo).value();
      const tabs = this.tabs();
      untracked(() => {
        if (this.loadedFor !== modulo) {
          this.cargar(value);
          this.loadedFor = modulo;
        }
        if (tabs.length && !tabs.some((t) => t.id === this.active())) {
          this.active.set(tabs[0].id);
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

  async guardar(): Promise<void> {
    try {
      await this.contenido.publicar(this.modulo(), this.draft() as never);
      this.snapshot = JSON.stringify(this.draft());
      this.toast.success('Contenido guardado.');
    } catch {
      this.toast.error('No se pudo guardar. Revise la conexión; el borrador sigue aquí.');
    }
  }

  cancelar(): void {
    this.cargar(this.contenido.de(this.modulo()).value());
  }

  async restaurar(): Promise<void> {
    try {
      await this.contenido.restaurar(this.modulo());
      await this.documentos.restaurarModulo(this.modulo());
      this.cargar(this.contenido.de(this.modulo()).value());
      this.toast.success('Se restauró el original de este módulo.');
    } catch {
      this.toast.error('No se pudo restaurar el original.');
    }
  }

  async abrirHistorial(): Promise<void> {
    this.historialAbierto.set(true);
    this.versionActiva.set(null);
    this.historialCargando.set(true);
    try {
      this.versiones.set(await this.api.versionesContenido(this.modulo()));
    } catch {
      this.toast.error('No se pudo cargar el historial.');
      this.historialAbierto.set(false);
    } finally {
      this.historialCargando.set(false);
    }
  }

  async verVersion(item: ContenidoVersion): Promise<void> {
    try {
      const completa = await this.api.versionContenido(this.modulo(), item.id);
      this.versionActiva.set(completa);
    } catch {
      this.toast.error('No se pudo leer esa versión.');
    }
  }

  async restaurarVersion(): Promise<void> {
    const ver = this.versionActiva();
    if (!ver) return;
    this.restaurandoVersion.set(true);
    try {
      const data = await this.api.restaurarVersionContenido(this.modulo(), ver.id);
      this.contenido.aplicar(this.modulo(), data);
      this.cargar(data);
      this.historialAbierto.set(false);
      this.toast.success('Se restauró esa versión. El cambio anterior quedó en el historial.');
    } catch {
      this.toast.error('No se pudo restaurar esa versión.');
    } finally {
      this.restaurandoVersion.set(false);
    }
  }

  fechaCorta(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('es-PE');
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

  private cargar(value: unknown): void {
    const cloned = structuredClone(value);
    this.draft.set(cloned);
    this.snapshot = JSON.stringify(cloned);
  }

  private cerrarAviso(salir: boolean): void {
    this.aviso.set(false);
    this.resolverAviso?.(salir);
    this.resolverAviso = null;
  }
}
