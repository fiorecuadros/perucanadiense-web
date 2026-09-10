import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../api/portal.api';
import type { AuthSession } from '../api/api.types';

const CLAVE_TOKEN = 'token';
const CLAVE_USUARIO = 'usuario';

type Usuario = NonNullable<AuthSession['user']>;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(PortalApi);
  private readonly router = inject(Router);

  /** Quién está en sesión. El panel lo usa para saludar y para ocultar lo que un editor no gestiona. */
  private readonly usuarioActual = signal<Usuario | null>(this.leerUsuario());

  readonly usuario = this.usuarioActual.asReadonly();
  readonly esAdmin = computed(() => this.usuarioActual()?.rol === 'admin');

  async login(username: string, password: string): Promise<void> {
    if (!environment.useRemoteApi) {
      this.saveToken('local-dev');
      this.guardarUsuario({ id: 'local', nombre: 'Modo local', rol: 'admin' });
      return;
    }
    const session = await this.api.login({ username, password });
    this.saveToken(session.token);
    if (session.user) this.guardarUsuario(session.user);
  }

  /** Recupera la sesión al recargar el panel: el token vive, el nombre no. */
  async refrescarSesion(): Promise<void> {
    if (!environment.useRemoteApi || !this.getToken()) return;
    try {
      const session = await this.api.sesion();
      if (session.user) this.guardarUsuario(session.user);
    } catch {
      // El interceptor ya redirige al login si el token dejó de valer.
    }
  }

  saveToken(token: string) {
    sessionStorage.setItem(CLAVE_TOKEN, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(CLAVE_TOKEN);
  }

  logout() {
    // El POST queda auditado en el servidor. Se dispara con el token aún en
    // sessionStorage para que el interceptor lo adjunte, y no se espera: si
    // el API falla igual se cierra la sesión local.
    if (environment.useRemoteApi && this.getToken()) {
      void this.api.logout().catch(() => undefined);
    }
    sessionStorage.removeItem(CLAVE_TOKEN);
    sessionStorage.removeItem(CLAVE_USUARIO);
    this.usuarioActual.set(null);
    this.router.navigate(['/admin/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private guardarUsuario(usuario: Usuario): void {
    this.usuarioActual.set(usuario);
    try {
      sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    } catch {
      // El nombre se mantiene en memoria aunque el storage falle.
    }
  }

  private leerUsuario(): Usuario | null {
    try {
      const crudo = sessionStorage.getItem(CLAVE_USUARIO);
      return crudo ? (JSON.parse(crudo) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
