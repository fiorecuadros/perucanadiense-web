import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="toast-host" role="status" aria-live="polite" aria-relevant="additions">
      @for (t of toast.toasts(); track t.id) {
        <div
          class="toast"
          [class.toast-ok]="t.type === 'success'"
          [class.toast-err]="t.type === 'error'"
        >
          {{ t.message }}
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHost {
  readonly toast = inject(ToastService);
}
