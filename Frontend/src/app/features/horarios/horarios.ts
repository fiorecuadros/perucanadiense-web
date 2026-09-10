import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InstitutionService } from '../../core/services/institution.service';
import { ContenidoStore } from '../../core/store/contenido.store';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Visor } from './components/visor/visor';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [PageHero, Visor],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Horarios {
  private readonly institution = inject(InstitutionService);
  readonly info = this.institution.info;
  readonly copy = inject(ContenidoStore).horarios.value;
}
