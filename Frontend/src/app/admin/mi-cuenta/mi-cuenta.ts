import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { PortalApi } from '../../core/api/portal.api';
import { ToastService } from '../shared/toast/toast';

/**
 * La cuenta de quien está usando el panel. Existe porque gestionar cuentas vive
 * en /admin/usuarios y eso es solo para administradores: sin esta pantalla, una
 * persona con rol editor nunca podría cambiar la contraseña que le dieron.
 */
@Component({
  selector: 'app-admin-mi-cuenta',
  standalone: true,
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Mi cuenta</h1>
          <p class="page-sub">Datos de la sesión y cambio de contraseña.</p>
        </div>
      </header>

      <div class="admin-card">
        <div class="form-grid">
          <div class="form-row">
            <label>Nombre</label>
            <p>{{ usuario()?.nombre || '—' }}</p>
          </div>
          <div class="form-row">
            <label>Rol</label>
            <p>{{ usuario()?.rol === 'admin' ? 'Administrador' : 'Editor' }}</p>
          </div>
        </div>
        @if (usuario()?.rol === 'editor') {
          <p class="form-hint">
            Como editor puede gestionar todo el contenido del portal. Crear o eliminar
            cuentas está reservado a los administradores.
          </p>
        }
      </div>

      <div class="admin-card">
        <h2 class="page-title">Cambiar contraseña</h2>
        <p class="form-hint">
          Al cambiarla se cierra la sesión en todos los dispositivos y tendrá que entrar
          de nuevo. Es lo que hace que una contraseña filtrada deje de servir.
        </p>

        <div class="form-grid">
          <div class="form-row span-2">
            <label for="pw-actual">Contraseña actual</label>
            <input
              id="pw-actual"
              type="password"
              autocomplete="current-password"
              [value]="actual()"
              (input)="actual.set($any($event.target).value)"
            />
          </div>
          <div class="form-row">
            <label for="pw-nueva">Nueva contraseña</label>
            <input
              id="pw-nueva"
              type="password"
              autocomplete="new-password"
              [value]="nueva()"
              (input)="nueva.set($any($event.target).value)"
            />
            <p class="form-hint">Mínimo 8 caracteres.</p>
          </div>
          <div class="form-row">
            <label for="pw-repetir">Repetir la nueva</label>
            <input
              id="pw-repetir"
              type="password"
              autocomplete="new-password"
              [value]="repetir()"
              (input)="repetir.set($any($event.target).value)"
            />
            @if (repetir() && !coinciden()) {
              <p class="campo-error">Las dos contraseñas no coinciden.</p>
            }
          </div>
        </div>

        <div class="save-bar">
          <button
            type="button"
            class="btn-save"
            [disabled]="!puedeGuardar() || guardando()"
            (click)="cambiar()"
          >
            {{ guardando() ? 'Cambiando…' : 'Cambiar contraseña' }}
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMiCuenta {
  private readonly auth = inject(AuthService);
  private readonly api = inject(PortalApi);
  private readonly toast = inject(ToastService);

  readonly usuario = this.auth.usuario;

  readonly actual = signal('');
  readonly nueva = signal('');
  readonly repetir = signal('');
  readonly guardando = signal(false);

  readonly coinciden = computed(() => this.nueva() === this.repetir());

  readonly puedeGuardar = computed(
    () => !!this.actual() && this.nueva().length >= 8 && this.coinciden(),
  );

  async cambiar(): Promise<void> {
    if (!this.puedeGuardar()) return;
    this.guardando.set(true);
    try {
      await this.api.cambiarPassword({ actual: this.actual(), nueva: this.nueva() });
      this.toast.success('Contraseña cambiada. Vuelva a iniciar sesión.');
      // El token en curso ya no vale: quedarse en el panel solo daría 401 en la
      // siguiente acción. Se sale de forma ordenada.
      this.auth.logout();
    } catch (error: unknown) {
      const respuesta = error as { status?: number; error?: { message?: string } };
      this.toast.error(
        respuesta.status === 401
          ? 'La contraseña actual no es correcta.'
          : respuesta.error?.message || 'No se pudo cambiar la contraseña.',
      );
    } finally {
      this.guardando.set(false);
    }
  }
}
