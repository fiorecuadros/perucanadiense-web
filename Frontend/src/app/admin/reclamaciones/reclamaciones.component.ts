import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PortalApi } from '../../core/api/portal.api';
import { BandejaTramites, type ColumnaBandeja } from '../shared/bandeja-tramites/bandeja-tramites';
import type { TramiteAdmin, TramiteCambioEstado } from '../../core/api/api.types';

@Component({
  selector: 'app-admin-reclamaciones',
  standalone: true,
  imports: [BandejaTramites],
  template: `
    <app-bandeja-tramites
      titulo="Libro de reclamaciones"
      descripcion="Reclamos y quejas registrados desde el portal. Deben atenderse dentro del plazo legal."
      etiquetaRespuesta="Respuesta al reclamante"
      [columnas]="columnas"
      [detalle]="detalle"
      [estados]="estados"
      [cargar]="cargar"
      [guardar]="guardar"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReclamacionesComponent {
  private readonly api = inject(PortalApi);

  readonly columnas: ColumnaBandeja[] = [
    { label: 'Código', campo: 'codigo' },
    { label: 'Reclamante', campo: 'nombres' },
    { label: 'Tipo', campo: 'tipoReclamo' },
    { label: 'Recibido', campo: 'fecha' },
    { label: 'Estado', campo: 'estado' },
  ];

  readonly detalle: ColumnaBandeja[] = [
    { label: 'Nombres', campo: 'nombres' },
    { label: 'Apellidos', campo: 'apellidos' },
    { label: 'Documento', campo: 'tipoDocumento' },
    { label: 'Número', campo: 'numeroDocumento' },
    { label: 'Correo', campo: 'email' },
    { label: 'Teléfono', campo: 'telefono' },
    { label: 'Dirección', campo: 'direccion' },
    { label: 'Tipo de reclamo', campo: 'tipoReclamo' },
    { label: 'Detalle', campo: 'detalleReclamo' },
    { label: 'Pedido', campo: 'pedido' },
  ];

  readonly estados = ['pendiente', 'en_proceso', 'resuelto'];

  readonly cargar = (): Promise<TramiteAdmin[]> => this.api.bandejaReclamos();
  readonly guardar = (id: string, cambio: TramiteCambioEstado): Promise<TramiteAdmin> =>
    this.api.cambiarEstadoReclamo(id, cambio);
}
