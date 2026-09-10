import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContenidoStore } from '../../core/store/contenido.store';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Pilares } from './components/pilares/pilares';
import { Historia } from './components/historia/historia';
import { Directorio } from './components/directorio/directorio';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [PageHero, Pilares, Historia, Directorio],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nosotros {
  private readonly contenido = inject(ContenidoStore);
  readonly copy = this.contenido.nosotros.value;
}
