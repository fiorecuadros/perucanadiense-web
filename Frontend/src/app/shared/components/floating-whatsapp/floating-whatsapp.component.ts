import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionService } from '../../../core/services/institution.service';

@Component({
  selector: 'app-floating-whatsapp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-whatsapp.component.html',
  styleUrl: './floating-whatsapp.component.css',
})
export class FloatingWhatsappComponent {
  private institutionService = inject(InstitutionService);
  readonly whatsappUrl = this.institutionService.whatsappUrl;
}
