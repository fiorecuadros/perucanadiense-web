import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Proceso } from './components/proceso/proceso';

@Component({
  selector: 'app-admision',
  standalone: true,
  imports: [Proceso],
  templateUrl: './admision.component.html',
  styleUrl: './admision.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdmisionComponent {}
