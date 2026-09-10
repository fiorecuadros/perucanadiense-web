import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { Gestion } from './components/gestion/gestion';
import { OtrosServicios } from './components/otros-servicios/otros-servicios';
import { Actualidad } from './components/actualidad/actualidad';
import { LogosCarousel } from './components/logos-carousel/logos-carousel';
import { StatBarComponent } from '../../shared/components/stat-bar/stat-bar.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [Hero, StatBarComponent, Gestion, OtrosServicios, Actualidad, LogosCarousel],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioComponent {}
