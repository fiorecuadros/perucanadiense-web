import { Directive, Input, computed, signal } from '@angular/core';
import { cn } from '../../../core/utils/cn';

@Directive({
  selector: '[appInput]',
  standalone: true,
  host: {
    '[class]': 'classes()',
  },
})
export class InputDirective {
  private readonly _userClass = signal<string>('');

  @Input()
  set class(c: string) {
    this._userClass.set(c);
  }

  readonly classes = computed(() =>
    cn(
      'flex h-11 w-full rounded-xl border border-[#E2E1EC] bg-white px-4 py-2 text-sm text-dark placeholder:text-[#9a98a6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
      this._userClass(),
    ),
  );
}
