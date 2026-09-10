import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Encabezado de un bloque dentro de un editor de contenido: título, texto de
 * apoyo opcional y contador opcional. El contenido del bloque va proyectado.
 */
@Component({
  selector: 'app-seccion-bloque',
  standalone: true,
  template: `
    <header class="sb-head">
      <div>
        <h3 class="sb-titulo">{{ titulo() }}</h3>
        @if (sub()) {
          <p class="sb-sub">{{ sub() }}</p>
        }
      </div>
      @if (cuenta() !== null) {
        <span class="sb-cuenta">{{ cuenta() }} {{ cuentaSufijo() }}</span>
      }
    </header>
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .sb-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .sb-titulo {
      margin: 0;
      font-size: 0.98rem;
      font-weight: 700;
      color: var(--adm-ink);
    }

    .sb-sub {
      margin: 3px 0 0;
      font-size: 0.8rem;
      color: var(--adm-ink-soft);
      line-height: 1.45;
    }

    .sb-cuenta {
      flex: none;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--adm-muted-bg);
      color: var(--adm-ink-soft);
      font-size: 0.74rem;
      font-weight: 600;
      white-space: nowrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionBloque {
  readonly titulo = input('');
  readonly sub = input('');
  readonly cuenta = input<number | null>(null);
  readonly cuentaSufijo = input('');
}
