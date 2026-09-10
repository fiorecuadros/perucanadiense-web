import { Component, Input, computed, signal } from '@angular/core';
import { cn } from '../../../core/utils/cn';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'classes()',
  },
})
export class CardComponent {
  private readonly _userClass = signal<string>('');
  @Input() set class(c: string) {
    this._userClass.set(c);
  }
  readonly classes = computed(() =>
    cn(
      'rounded-2xl border border-[#E2E1EC] bg-white text-[#2B293D] shadow-sm transition-all duration-300 hover:shadow-md block',
      this._userClass(),
    ),
  );
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'classes()',
  },
})
export class CardHeaderComponent {
  private readonly _userClass = signal<string>('');
  @Input() set class(c: string) {
    this._userClass.set(c);
  }
  readonly classes = computed(() => cn('flex flex-col space-y-1.5 p-6 block', this._userClass()));
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'classes()',
  },
})
export class CardTitleComponent {
  private readonly _userClass = signal<string>('');
  @Input() set class(c: string) {
    this._userClass.set(c);
  }
  readonly classes = computed(() =>
    cn('text-xl font-bold leading-none tracking-tight text-dark block', this._userClass()),
  );
}

@Component({
  selector: 'app-card-description',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'classes()',
  },
})
export class CardDescriptionComponent {
  private readonly _userClass = signal<string>('');
  @Input() set class(c: string) {
    this._userClass.set(c);
  }
  readonly classes = computed(() =>
    cn('text-sm text-muted block leading-relaxed', this._userClass()),
  );
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'classes()',
  },
})
export class CardContentComponent {
  private readonly _userClass = signal<string>('');
  @Input() set class(c: string) {
    this._userClass.set(c);
  }
  readonly classes = computed(() => cn('p-6 pt-0 block', this._userClass()));
}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'classes()',
  },
})
export class CardFooterComponent {
  private readonly _userClass = signal<string>('');
  @Input() set class(c: string) {
    this._userClass.set(c);
  }
  readonly classes = computed(() => cn('flex items-center p-6 pt-0 block', this._userClass()));
}
