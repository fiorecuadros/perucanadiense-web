import { Component, Input, computed, signal } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../core/utils/cn';

export const alertVariants = cva(
  'relative w-full rounded-xl border p-4 [&>i~*]:pl-7 [&>i+div]:translate-y-[-3px] [&>i]:absolute [&>i]:left-4 [&>i]:top-4 [&>i]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-white text-dark border-[#E2E1EC]',
        primary: 'bg-primary-light text-dark border-primary/30 [&>i]:text-primary',
        minedu: 'bg-blue-50 text-minedu border-blue-200 [&>i]:text-minedu',
        destructive: 'border-red-200 bg-red-50 text-red-900 [&>i]:text-red-600',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900 [&>i]:text-emerald-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;

@Component({
  selector: 'app-alert',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'classes()',
  },
})
export class AlertComponent {
  private readonly _variant = signal<AlertVariants['variant']>('default');
  private readonly _userClass = signal<string>('');

  @Input()
  set variant(v: AlertVariants['variant']) {
    this._variant.set(v);
  }

  @Input()
  set class(c: string) {
    this._userClass.set(c);
  }

  readonly classes = computed(() =>
    cn(alertVariants({ variant: this._variant() }), this._userClass()),
  );
}
