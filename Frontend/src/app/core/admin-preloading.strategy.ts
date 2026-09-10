import { Injectable } from '@angular/core';
import {
  PreloadingStrategy,
  Route,
  Router
} from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Estrategia de preloading personalizada que precarga rutas del admin
 * de forma selectiva para mejorar el rendimiento
 */
@Injectable({ providedIn: 'root' })
export class AdminPreloadingStrategy implements PreloadingStrategy {
  private readonly adminRoutes = new Set<string>();
  private loadedRoutes = new Set<string>();

  constructor(private router: Router) {
    // Identificar rutas de admin importantes para precargar
    const importantRoutes = ['dashboard', 'contenido', 'noticias', 'personal'];
    
    this.router.config.forEach(route => {
      if (route.path === 'admin' && route.children) {
        route.children.forEach(child => {
          if (child.path && importantRoutes.includes(child.path)) {
            this.adminRoutes.add(`/admin/${child.path}`);
          }
        });
      }
    });
  }

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // No precargar rutas que no son de admin importantes
    if (!route.path || !this.isAdminRoute(route)) {
      return of(null);
    }

    // Ya cargado
    const routePath = this.getRoutePath(route);
    if (this.loadedRoutes.has(routePath)) {
      return of(null);
    }

    // Precargar solo rutas importantes
    this.loadedRoutes.add(routePath);
    return load();
  }

  private isAdminRoute(route: Route): boolean {
    const routePath = this.getRoutePath(route);
    return this.adminRoutes.has(routePath);
  }

  private getRoutePath(route: Route): string {
    return `/${route.path}`;
  }
}
