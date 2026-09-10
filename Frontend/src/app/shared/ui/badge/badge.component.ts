import { Component, Input, computed, signal } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../core/utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow',
        outline: 'border border-border text-dark',
        accent: 'border-transparent bg-primary-light text-primary font-bold',
        minedu: 'border-transparent bg-minedu text-white',
        success: 'border-transparent bg-emerald-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'classes()',
  },
})
export class BadgeComponent {
  private readonly _variant = signal<BadgeVariants['variant']>('default');
  private readonly _userClass = signal<string>('');

  @Input()
  set variant(v: BadgeVariants['variant']) {
    this._variant.set(v);
  }

  @Input()
  set class(c: string) {
    this._userClass.set(c);
  }

  readonly classes = computed(() =>
    cn(badgeVariants({ variant: this._variant() }), this._userClass()),
  );
}
