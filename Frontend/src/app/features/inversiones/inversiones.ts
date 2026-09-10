import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InstitutionService } from '../../core/services/institution.service';
import { ContenidoStore } from '../../core/store/contenido.store';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Visor } from './components/visor/visor';

@Component({
  selector: 'app-inversiones',
  standalone: true,
  imports: [PageHero, Visor],
  templateUrl: './inversiones.html',
  styleUrl: './inversiones.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inversiones {
  private readonly institution = inject(InstitutionService);
  readonly info = this.institution.info;
  readonly copy = inject(ContenidoStore).inversiones.value;
}
