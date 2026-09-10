import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DialogComponent } from '../../../shared/ui';

@Component({
  selector: 'app-aviso-cambios',
  standalone: true,
  imports: [DialogComponent],
  template: `
    <app-dialog [open]="abierto()" title="Hay cambios sin guardar" (openChange)="onOpen($event)">
      <p>Si sale ahora, se perderán los cambios de esta pantalla.</p>
      <div dialog-footer>
        <button type="button" class="btn-cancel" (click)="seguir.emit()">Seguir aquí</button>
        <button type="button" class="btn-ghost" (click)="descartar.emit()">Descartar</button>
        <button type="button" class="btn-save" (click)="guardar.emit()">Guardar</button>
      </div>
    </app-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvisoCambios {
  readonly abierto = input(false);
  readonly guardar = output<void>();
  readonly descartar = output<void>();
  readonly seguir = output<void>();

  onOpen(open: boolean): void {
    if (!open) this.seguir.emit();
  }
}
