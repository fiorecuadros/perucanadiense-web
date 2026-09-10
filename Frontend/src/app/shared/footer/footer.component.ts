import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../core/services/institution.service';
import { MenuStore } from '../../core/store/menu.store';
import { EnlaceMenu } from '../enlace-menu/enlace-menu';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, EnlaceMenu],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly institution = inject(InstitutionService);
  private readonly menu = inject(MenuStore);

  readonly info = this.institution.info;
  // Las dos columnas de enlaces se editan en /admin/menu.
  readonly institucional = this.menu.pieInstitucional;
  readonly servicios = this.menu.pieServicios;
  readonly currentYear = new Date().getFullYear();
}
