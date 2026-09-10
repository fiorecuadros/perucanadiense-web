import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PortalApi } from '../../core/api/portal.api';
import { BandejaTramites, type ColumnaBandeja } from '../shared/bandeja-tramites/bandeja-tramites';
import type { TramiteAdmin, TramiteCambioEstado } from '../../core/api/api.types';

@Component({
  selector: 'app-admin-mesa-de-partes',
  standalone: true,
  imports: [BandejaTramites],
  template: `
    <app-bandeja-tramites
      titulo="Mesa de partes virtual"
      descripcion="Documentos recibidos por el portal. El estado que fije aquí es el que ve el ciudadano al consultar su código."
      etiquetaRespuesta="Observación interna"
      campoCorreo="correo"
      [columnas]="columnas"
      [detalle]="detalle"
      [estados]="estados"
      [cargar]="cargar"
      [guardar]="guardar"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMesaDePartesComponent {
  private readonly api = inject(PortalApi);

  readonly columnas: ColumnaBandeja[] = [
    { label: 'Código', campo: 'codigo' },
    { label: 'Remitente', campo: 'nombres' },
    { label: 'Documento', campo: 'tipoDoc' },
    { label: 'Asunto', campo: 'asunto' },
    { label: 'Recibido', campo: 'fecha' },
    { label: 'Estado', campo: 'estado' },
  ];

  readonly detalle: ColumnaBandeja[] = [
    { label: 'Remitente', campo: 'nombres' },
    { label: 'DNI', campo: 'dni' },
    { label: 'Condición', campo: 'condicion' },
    { label: 'Correo', campo: 'correo' },
    { label: 'Teléfono', campo: 'telefono' },
    { label: 'Tipo de documento', campo: 'tipoDoc' },
    { label: 'Folios', campo: 'folios' },
    { label: 'Archivo adjunto', campo: 'fileName' },
    { label: 'Descargar adjunto', campo: 'archivoUrl' },
    { label: 'Enlace del documento', campo: 'linkDocumento' },
    { label: 'Asunto', campo: 'asunto' },
    { label: 'Mensaje', campo: 'mensaje' },
  ];

  readonly estados = ['pendiente', 'recibido', 'en_tramite', 'finalizado'];

  readonly cargar = (): Promise<TramiteAdmin[]> => this.api.bandejaMesa();
  readonly guardar = (id: string, cambio: TramiteCambioEstado): Promise<TramiteAdmin> =>
    this.api.cambiarEstadoMesa(id, cambio);
}
