import { Directive, Input, computed, signal } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../core/utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow active:scale-[0.98]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:scale-[0.98]',
        outline:
          'border-2 border-primary text-primary bg-transparent hover:bg-primary-light active:scale-[0.98]',
        dark: 'bg-dark text-white hover:bg-dark-surface active:scale-[0.98]',
        ghost: 'hover:bg-secondary text-dark active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
        destructive:
          'bg-destructive text-destructive-foreground hover:opacity-90 active:scale-[0.98]',
        whatsapp: 'bg-whatsapp text-white hover:opacity-95 shadow-sm active:scale-[0.98]',
        minedu: 'bg-minedu text-white hover:opacity-95 shadow-sm active:scale-[0.98]',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-md px-3.5 text-xs',
        lg: 'h-13 rounded-xl px-8 text-base font-bold',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

@Directive({
  selector: '[appButton]',
  standalone: true,
  host: {
    '[class]': 'classes()',
  },
})
export class ButtonDirective {
  private readonly _variant = signal<ButtonVariants['variant']>('default');
  private readonly _size = signal<ButtonVariants['size']>('default');
  private readonly _userClass = signal<string>('');

  @Input()
  set variant(v: ButtonVariants['variant']) {
    this._variant.set(v);
  }

  @Input()
  set size(s: ButtonVariants['size']) {
    this._size.set(s);
  }

  @Input()
  set class(c: string) {
    this._userClass.set(c);
  }

  readonly classes = computed(() =>
    cn(
      buttonVariants({
        variant: this._variant(),
        size: this._size(),
      }),
      this._userClass(),
    ),
  );
}
