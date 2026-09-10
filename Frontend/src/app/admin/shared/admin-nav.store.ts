import { Injectable, signal } from '@angular/core';

const CLAVE_COLAPSADO = 'adm-nav-colapsado';

/**
 * Estado compartido de la navegación del panel: el riel contraído en escritorio
 * y el cajón deslizante en móvil. Lo consumen la topbar (botón hamburguesa) y el
 * propio sidebar.
 */
@Injectable({ providedIn: 'root' })
export class AdminNavStore {
  /** Riel contraído en escritorio. Se recuerda entre sesiones. */
  readonly colapsado = signal(this.leerColapsado());

  /** Cajón de navegación abierto en móvil. */
  readonly cajonAbierto = signal(false);

  alternarColapso(): void {
    this.colapsado.update((v) => !v);
    try {
      localStorage.setItem(CLAVE_COLAPSADO, this.colapsado() ? '1' : '0');
    } catch {
      // Sin persistencia: el estado vive sólo en memoria.
    }
  }

  abrirCajon(): void {
    this.cajonAbierto.set(true);
  }

  cerrarCajon(): void {
    this.cajonAbierto.set(false);
  }

  alternarCajon(): void {
    this.cajonAbierto.update((v) => !v);
  }

  private leerColapsado(): boolean {
    try {
      return localStorage.getItem(CLAVE_COLAPSADO) === '1';
    } catch {
      return false;
    }
  }
}
