import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../core/services/institution.service';
import { ContenidoStore } from '../../core/store/contenido.store';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { EvaHubComponent } from '../../shared/components/eva-hub/eva-hub.component';
import { ButtonDirective } from '../../shared/ui';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [RouterLink, PageHero, EvaHubComponent, ButtonDirective],
  templateUrl: './servicios.component.html',
  styleUrls: ['../../shared/styles/service-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiciosComponent {
  private readonly institution = inject(InstitutionService);
  readonly info = this.institution.info;
  readonly copy = inject(ContenidoStore).servicios.value;
}
