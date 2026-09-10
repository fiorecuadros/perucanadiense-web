import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type {
  InicioHeroImage,
  InicioLogo,
  InicioService,
} from '../../../core/constants/inicio.constant';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from '../../shared/editor-modulo/editor-modulo-marco';
import { InicioPanelLogos } from './panel-logos';
import { InicioPanelPortada } from './panel-portada';
import { InicioPanelServicios } from './panel-servicios';

const TABS: MarcoTab[] = [
  { id: 'portada', label: 'Portada' },
  { id: 'servicios', label: 'Otros servicios' },
  { id: 'logos', label: 'Logos institucionales' },
];

@Component({
  selector: 'app-admin-inicio',
  standalone: true,
  imports: [EditorModuloMarco, InicioPanelPortada, InicioPanelServicios, InicioPanelLogos],
  template: `
    <app-editor-modulo-marco
      [editor]="this"
      titulo="Inicio"
      sub="Los cambios se publicarán automáticamente en el portal web al guardar."
      publicPath="/inicio"
      [tabs]="tabs"
      [(activa)]="activa"
    >
      @switch (activa()) {
        @case ('portada') {
          <app-inicio-panel-portada
            [imagenes]="draft().heroImages"
            [licencia]="draft().licensingImage"
            (imagenesChange)="parche({ heroImages: $event })"
            (licenciaChange)="parche({ licensingImage: $event })"
            (pedirEliminarImagen)="confirmarEliminarImagen($event)"
            (pedirQuitarLicencia)="confirmarQuitarLicencia()"
          />
        }
        @case ('servicios') {
          <app-inicio-panel-servicios
            [items]="draft().services"
            (itemsChange)="parche({ services: $event })"
            (pedirEliminar)="confirmarEliminarServicio($event)"
          />
        }
        @case ('logos') {
          <app-inicio-panel-logos
            [items]="draft().logos"
            (itemsChange)="parche({ logos: $event })"
            (pedirEliminar)="confirmarEliminarLogo($event)"
          />
        }
      }
    </app-editor-modulo-marco>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInicio extends EditorModuloBase<'inicio'> {
  protected readonly moduloId = 'inicio' as const;

  readonly tabs = TABS;
  readonly activa = signal('portada');

  confirmarEliminarImagen(index: number): void {
    const nombre = this.draft().heroImages[index]?.alt?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar imagen del carrusel',
      detalle: nombre
        ? `Se quitará «${nombre}» del carrusel de portada. Esta acción no se puede deshacer.`
        : 'Se quitará esta imagen del carrusel de portada. Esta acción no se puede deshacer.',
      accion: () => this.parche({ heroImages: this.sinIndice(this.draft().heroImages, index) }),
    });
  }

  confirmarQuitarLicencia(): void {
    this.pedirConfirmacion({
      titulo: 'Quitar imagen de licenciamiento',
      detalle:
        'La ventana emergente de licenciamiento quedará sin imagen hasta que suba una nueva.',
      accion: () => this.parche({ licensingImage: { src: '', alt: '' } }),
    });
  }

  confirmarEliminarServicio(index: number): void {
    const nombre = this.draft().services[index]?.title?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar servicio',
      detalle: nombre
        ? `Se eliminará el servicio «${nombre}». Esta acción no se puede deshacer.`
        : 'Se eliminará este servicio. Esta acción no se puede deshacer.',
      accion: () => this.parche({ services: this.sinIndice(this.draft().services, index) }),
    });
  }

  confirmarEliminarLogo(index: number): void {
    const nombre = this.draft().logos[index]?.alt?.trim();
    this.pedirConfirmacion({
      titulo: 'Eliminar institución',
      detalle: nombre
        ? `Se eliminará el logo de «${nombre}». Esta acción no se puede deshacer.`
        : 'Se eliminará este logo. Esta acción no se puede deshacer.',
      accion: () => this.parche({ logos: this.sinIndice(this.draft().logos, index) }),
    });
  }

  private sinIndice<T>(lista: T[], index: number): T[] {
    return lista.filter((_, i) => i !== index);
  }
}

export type { InicioHeroImage, InicioLogo, InicioService };
