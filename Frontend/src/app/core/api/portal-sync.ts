import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ContenidoStore, CONTENT_KEYS, type ContentByModulo } from '../store/contenido.store';
import { DocumentosStore } from '../store/documentos.store';
import type { ModuloId } from '../models/documento.model';
import { NewsService } from '../services/news.service';
import { RepositorioService } from '../services/repositorio.service';
import { FacultyStore } from '../store/faculty.store';
import { InstitutionService } from '../services/institution.service';
import { MenuStore } from '../store/menu.store';
import { PortalApi } from './portal.api';

const MODULOS = Object.keys(CONTENT_KEYS) as ModuloId[];

@Injectable({ providedIn: 'root' })
export class PortalSync {
  private readonly api = inject(PortalApi);
  private readonly contenido = inject(ContenidoStore);
  private readonly documentos = inject(DocumentosStore);
  private readonly noticias = inject(NewsService);
  private readonly repositorio = inject(RepositorioService);
  private readonly personal = inject(FacultyStore);
  private readonly institucion = inject(InstitutionService);
  private readonly menu = inject(MenuStore);

  // Sistema de caché para evitar recargas innecesarias
  private publicHydrated = false;
  private adminHydrated = false;
  private lastHydrationTime = 0;
  private readonly HYDRATION_CACHE_TIME = 5 * 60 * 1000; // 5 minutos

  async hydratePublic(): Promise<void> {
    if (!environment.useRemoteApi) return;
    
    // Verificar si ya está hidratado recientemente
    const now = Date.now();
    if (this.publicHydrated && (now - this.lastHydrationTime) < this.HYDRATION_CACHE_TIME) {
      return;
    }

    await Promise.allSettled([
      this.hidratarContenido(),
      this.documentos.hidratar(true),
      this.noticias.hidratar(),
      this.repositorio.hidratar(),
      this.personal.hidratar(),
      this.institucion.hidratar(),
      this.menu.hidratar(),
    ]);

    this.publicHydrated = true;
    this.lastHydrationTime = now;
  }

  async hydrateAdmin(): Promise<void> {
    if (!environment.useRemoteApi) return;
    
    // Verificar si ya está hidratado recientemente
    const now = Date.now();
    if (this.adminHydrated && (now - this.lastHydrationTime) < this.HYDRATION_CACHE_TIME) {
      return;
    }

    await Promise.allSettled([
      this.hidratarContenido(),
      this.documentos.hidratar(false),
      this.noticias.hidratarAdmin(),
      this.personal.hidratar(),
      this.institucion.hidratar(),
      this.menu.hidratar(),
    ]);

    this.adminHydrated = true;
    this.lastHydrationTime = now;
  }

  /**
   * Fuerza la recarga de datos, ignorando el caché
   */
  async forceHydrateAdmin(): Promise<void> {
    this.adminHydrated = false;
    this.lastHydrationTime = 0;
    return this.hydrateAdmin();
  }

  private async hidratarContenido(): Promise<void> {
    // Optimización: cargar módulos en lotes para no saturar la API
    const batchSize = 5;
    for (let i = 0; i < MODULOS.length; i += batchSize) {
      const batch = MODULOS.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (modulo) => {
          try {
            const data = await this.api.contenido(modulo);
            if (
              !data ||
              typeof data !== 'object' ||
              Array.isArray(data) ||
              !Object.keys(data).length
            ) {
              return;
            }
            this.contenido.aplicar(modulo, data as ContentByModulo[typeof modulo]);
          } catch {
            // Se conserva el copy local / seed.
          }
        }),
      );
    }
  }
}
