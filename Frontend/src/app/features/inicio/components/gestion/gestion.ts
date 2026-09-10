import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reveal } from '../../../../core/directives/reveal';
import { InstitutionService } from '../../../../core/services/institution.service';

@Component({
  selector: 'app-inicio-gestion',
  standalone: true,
  imports: [RouterLink, Reveal],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gestion {
  private readonly institution = inject(InstitutionService);
  readonly info = this.institution.info;
}
