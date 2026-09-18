import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PortalApi } from '../../core/api/portal.api';
import {
  BandejaTramites,
  type ColumnaBandeja,
} from '../shared/bandeja-tramites/bandeja-tramites';
import type {
  TramiteAdmin,
  TramiteCambioEstado,
} from '../../core/api/api.types';

@Component({
  selector: 'app-admin-accesibilidad',
  standalone: true,
  imports: [BandejaTramites],
  template: `
    <app-bandeja-tramites
      titulo="Reportes de accesibilidad"
      descripcion="Reportes enviados desde la herramienta Ayuda de accesibilidad del portal."
      etiquetaRespuesta="Respuesta al usuario"
      [columnas]="columnas"
      [detalle]="detalle"
      [estados]="estados"
      [cargar]="cargar"
      [guardar]="guardar"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAccesibilidadComponent {
  private readonly api = inject(PortalApi);

  readonly columnas: ColumnaBandeja[] = [
    { label: 'Código', campo: 'codigo' },
    { label: 'Nombre', campo: 'name' },
    { label: 'Tipo', campo: 'assistanceType' },
    { label: 'Recibido', campo: 'fecha' },
    { label: 'Estado', campo: 'estado' },
  ];

  readonly detalle: ColumnaBandeja[] = [
    { label: 'Nombre', campo: 'name' },
    { label: 'Correo', campo: 'email' },
    { label: 'Teléfono', campo: 'phone' },
    { label: 'Tipo de asistencia', campo: 'assistanceType' },
    { label: 'Descripción', campo: 'description' },
  ];

  readonly estados = ['pendiente', 'en_proceso', 'resuelto'];

  readonly cargar = (): Promise<TramiteAdmin[]> =>
    this.api.bandejaAccesibilidad();

  readonly guardar = (
    id: string,
    cambio: TramiteCambioEstado,
  ): Promise<TramiteAdmin> =>
    this.api.cambiarEstadoAccesibilidad(id, cambio);
}
