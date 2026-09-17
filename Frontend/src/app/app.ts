import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AccessibilityComponent } from './components/accessibility/accesibility';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AccessibilityComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  mostrarAccesibilidad = false;

  constructor(private router: Router) {
    this.actualizarVisibilidad(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.actualizarVisibilidad(event.urlAfterRedirects);
      });
  }

  private actualizarVisibilidad(url: string): void {
    this.mostrarAccesibilidad = !url.startsWith('/admin');
  }
}

