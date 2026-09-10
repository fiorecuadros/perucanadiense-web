import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PortalApi } from '../../core/api/portal.api';
import { BandejaTramites, type ColumnaBandeja } from '../shared/bandeja-tramites/bandeja-tramites';
import type { TramiteAdmin, TramiteCambioEstado } from '../../core/api/api.types';

type Pestana = 'acceso' | 'citas' | 'apoyo';

/**
 * Las otras tres bandejas del portal. Sin esta pantalla, un estudiante pide una
 * cita psicopedagógica o apoyo social, el portal le da un código… y nadie del
 * instituto lo lee nunca.
 */
@Component({
  selector: 'app-admin-solicitudes',
  standalone: true,
  imports: [BandejaTramites],
  templateUrl: './solicitudes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSolicitudes {
  private readonly api = inject(PortalApi);

  readonly pestana = signal<Pestana>('acceso');

  readonly pestanas: { id: Pestana; label: string }[] = [
    { id: 'acceso', label: 'Acceso a la información' },
    { id: 'citas', label: 'Citas psicopedagógicas' },
    { id: 'apoyo', label: 'Servicio social' },
  ];

  readonly configuraciones: Record<
    Pestana,
    {
      titulo: string;
      descripcion: string;
      columnas: ColumnaBandeja[];
      detalle: ColumnaBandeja[];
      estados: string[];
      cargar: () => Promise<TramiteAdmin[]>;
      guardar: (id: string, cambio: TramiteCambioEstado) => Promise<TramiteAdmin>;
    }
  > = {
    acceso: {
      titulo: 'Acceso a la información pública',
      descripcion:
        'Solicitudes amparadas en la Ley 27806. El plazo de respuesta corre desde la fecha de recepción.',
      columnas: [
        { label: 'Código', campo: 'codigo' },
        { label: 'Solicitante', campo: 'nombres' },
        { label: 'DNI', campo: 'dni' },
        { label: 'Recibido', campo: 'fecha' },
        { label: 'Estado', campo: 'estado' },
      ],
      detalle: [
        { label: 'Nombres', campo: 'nombres' },
        { label: 'Apellidos', campo: 'apellidos' },
        { label: 'DNI', campo: 'dni' },
        { label: 'Correo', campo: 'email' },
        { label: 'Teléfono', campo: 'telefono' },
        { label: 'Dirección', campo: 'direccion' },
        { label: 'Información solicitada', campo: 'informacionSolicitada' },
        { label: 'Motivo', campo: 'motivo' },
      ],
      estados: ['pendiente', 'en_proceso', 'atendida', 'denegada'],
      cargar: () => this.api.bandejaAcceso(),
      guardar: (id, cambio) => this.api.cambiarEstadoAcceso(id, cambio),
    },
    citas: {
      titulo: 'Citas psicopedagógicas',
      descripcion: 'Solicitudes de atención del servicio psicopedagógico.',
      columnas: [
        { label: 'Código', campo: 'codigo' },
        { label: 'Estudiante', campo: 'nombres' },
        { label: 'Programa', campo: 'programa' },
        { label: 'Fecha preferida', campo: 'fechaPreferida' },
        { label: 'Estado', campo: 'estado' },
      ],
      detalle: [
        { label: 'Nombres', campo: 'nombres' },
        { label: 'Apellidos', campo: 'apellidos' },
        { label: 'DNI', campo: 'dni' },
        { label: 'Correo', campo: 'email' },
        { label: 'Teléfono', campo: 'telefono' },
        { label: 'Programa', campo: 'programa' },
        { label: 'Semestre', campo: 'semestre' },
        { label: 'Fecha preferida', campo: 'fechaPreferida' },
        { label: 'Motivo', campo: 'motivo' },
      ],
      estados: ['pendiente', 'confirmada', 'atendida', 'cancelada'],
      cargar: () => this.api.bandejaCitas(),
      guardar: (id, cambio) => this.api.cambiarEstadoCita(id, cambio),
    },
    apoyo: {
      titulo: 'Servicio social',
      descripcion: 'Pedidos de apoyo social de estudiantes.',
      columnas: [
        { label: 'Código', campo: 'codigo' },
        { label: 'Estudiante', campo: 'nombres' },
        { label: 'Tipo de apoyo', campo: 'tipoApoyo' },
        { label: 'Recibido', campo: 'fecha' },
        { label: 'Estado', campo: 'estado' },
      ],
      detalle: [
        { label: 'Nombres', campo: 'nombres' },
        { label: 'Apellidos', campo: 'apellidos' },
        { label: 'DNI', campo: 'dni' },
        { label: 'Correo', campo: 'email' },
        { label: 'Teléfono', campo: 'telefono' },
        { label: 'Programa', campo: 'programa' },
        { label: 'Semestre', campo: 'semestre' },
        { label: 'Tipo de apoyo', campo: 'tipoApoyo' },
        { label: 'Situación', campo: 'descripcionSituacion' },
      ],
      estados: ['pendiente', 'en_evaluacion', 'atendida', 'cerrada'],
      cargar: () => this.api.bandejaApoyo(),
      guardar: (id, cambio) => this.api.cambiarEstadoApoyo(id, cambio),
    },
  };

  readonly actual = computed(() => this.configuraciones[this.pestana()]);
}
