import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PortalSync } from '../../core/api/portal-sync';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { FloatingWhatsappComponent } from '../../shared/components/floating-whatsapp/floating-whatsapp.component';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, FloatingWhatsappComponent, ChatbotComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css',
})
export class PublicLayoutComponent {
  private readonly sync = inject(PortalSync);

  constructor() {
    // La hidratación ahora tiene caché interno, así que es seguro llamarla siempre
    void this.sync.hydratePublic();
  }
}
