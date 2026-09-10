import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-comunicados',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Comunicados</h1>
          <p class="page-sub">
            Los comunicados oficiales se publican desde Noticias, con el tipo Comunicado. Así
            aparecen en el mismo listado público.
          </p>
        </div>
        <a class="btn-add" routerLink="/admin/noticias">
          <i class="fa fa-newspaper"></i> Ir a noticias
        </a>
      </header>
      <div class="admin-card">
        <p class="page-sub" style="margin:0">
          En el formulario elija tipo <strong>Comunicado</strong>, suba la imagen y redacte el
          cuerpo. Al guardar se ve en /noticias.
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComunicadosComponent {}
