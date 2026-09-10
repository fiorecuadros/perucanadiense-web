import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-hero',
  standalone: true,
  templateUrl: './page-hero.html',
  styleUrl: './page-hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHero {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly variant = input<'default' | 'breadcrumb'>('default');
}
