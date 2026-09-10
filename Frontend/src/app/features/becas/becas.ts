import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InstitutionService } from '../../core/services/institution.service';
import { ContenidoStore } from '../../core/store/contenido.store';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Visor } from './components/visor/visor';

@Component({
  selector: 'app-becas',
  standalone: true,
  imports: [PageHero, Visor],
  templateUrl: './becas.html',
  styleUrl: './becas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Becas {
  private readonly institution = inject(InstitutionService);
  readonly info = this.institution.info;
  readonly copy = inject(ContenidoStore).becas.value;
}
