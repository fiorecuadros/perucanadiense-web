import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-dark/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          (click)="onClose()"
        ></div>

        <!-- Dialog Box -->
        <div
          class="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 animate-in zoom-in-95 border border-[#E2E1EC]"
        >
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E1EC]">
            <h3 class="text-lg font-bold text-dark">{{ title }}</h3>
            <button
              type="button"
              (click)="onClose()"
              class="rounded-lg p-1.5 text-muted hover:bg-secondary hover:text-dark transition-colors"
              aria-label="Cerrar modal"
            >
              <i class="fa fa-times text-base"></i>
            </button>
          </div>

          <div class="py-2 text-sm text-[#6C6A74] leading-relaxed">
            <ng-content></ng-content>
          </div>

          @if (showFooter) {
            <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E2E1EC]">
              <ng-content select="[dialog-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class DialogComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() showFooter = true;
  @Output() openChange = new EventEmitter<boolean>();

  onClose() {
    this.open = false;
    this.openChange.emit(false);
  }
}
