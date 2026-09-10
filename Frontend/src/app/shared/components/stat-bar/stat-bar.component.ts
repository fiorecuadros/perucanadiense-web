import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CountUp } from '../../../core/directives/count-up';
import { Reveal } from '../../../core/directives/reveal';
import { InstitutionService } from '../../../core/services/institution.service';

@Component({
  selector: 'app-stat-bar',
  standalone: true,
  imports: [CountUp, Reveal],
  templateUrl: './stat-bar.component.html',
  styleUrl: './stat-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatBarComponent {
  private institutionService = inject(InstitutionService);
  readonly info = this.institutionService.info;
}
