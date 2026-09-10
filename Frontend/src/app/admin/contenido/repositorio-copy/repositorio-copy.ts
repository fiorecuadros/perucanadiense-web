import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvisoBeta } from '../../shared/aviso-beta/aviso-beta';

/**
 * Los textos del repositorio siguen en preparación: por ahora se muestra un
 * marcador «Beta». El esquema anterior se conserva en `repositorio-copy.schema.ts`.
 */
@Component({
  selector: 'app-admin-repositorio-copy',
  standalone: true,
  imports: [AvisoBeta],
  template: `
    <app-aviso-beta
      titulo="Textos del repositorio"
      sub="Editor en preparación."
      mensaje="El repositorio institucional todavía se está armando. Cuando esté listo podrá editar aquí los textos de la página; por ahora no hay nada que cambiar."
      publicPath="/repositorio"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRepositorioCopy {}
