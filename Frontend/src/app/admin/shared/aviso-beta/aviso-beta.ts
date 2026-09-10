import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página de marcador para un módulo del panel que todavía no tiene editor
 * amigable: cabecera + tarjeta «Beta» explicando que el contenido se gestiona
 * en otro lado por ahora.
 */
@Component({
  selector: 'app-aviso-beta',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ titulo() }} <span class="etiqueta-beta">Beta</span></h1>
          <p class="page-sub">{{ sub() }}</p>
        </div>
        @if (publicPath()) {
          <a class="btn-ghost" [routerLink]="publicPath()" target="_blank" rel="noopener">
            <i class="fa fa-arrow-up-right-from-square" aria-hidden="true"></i> Ver página pública
          </a>
        }
      </header>

      <div class="beta-tarjeta">
        <span class="beta-icono" aria-hidden="true"><i class="fa fa-screwdriver-wrench"></i></span>
        <div>
          <h2>Estamos preparando este editor</h2>
          <p>{{ mensaje() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .etiqueta-beta {
      padding: 2px 9px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--adm-brand) 16%, var(--adm-surface));
      color: var(--adm-brand);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .beta-tarjeta {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      padding: 22px;
      border: 1px solid var(--adm-line);
      border-radius: var(--adm-radius);
      background: var(--adm-surface);
      box-shadow: var(--adm-shadow);
      max-width: 640px;
    }

    .beta-icono {
      width: 44px;
      height: 44px;
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 11px;
      background: color-mix(in srgb, var(--adm-brand) 12%, var(--adm-surface));
      color: var(--adm-brand);
      font-size: 1.15rem;
    }

    .beta-tarjeta h2 {
      margin: 0 0 4px;
      font-size: 1rem;
      font-weight: 700;
      color: var(--adm-ink);
    }

    .beta-tarjeta p {
      margin: 0;
      font-size: 0.88rem;
      color: var(--adm-ink-soft);
      line-height: 1.55;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoBeta {
  readonly titulo = input.required<string>();
  readonly sub = input('Este módulo está en preparación.');
  readonly mensaje = input(
    'Pronto podrá editar este contenido desde aquí. Por ahora no hay cambios que hacer en esta sección.',
  );
  readonly publicPath = input('');
}
