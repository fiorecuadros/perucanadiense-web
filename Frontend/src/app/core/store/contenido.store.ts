import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../api/portal.api';
import { ABOUT_COPY, type AboutContent } from '../constants/about.constant';
import { normalizarNosotros } from '../constants/about.normalizar';
import {
  ADMISSION_COPY,
  normalizarAdmision,
  type AdmissionContent,
} from '../constants/admission.constant';
import { BECAS_COPY, type BecasContent } from '../constants/becas.constant';
import { COSTOS_COPY, type CostosContent } from '../constants/costos.constant';
import { ESTADISTICAS_COPY, type EstadisticasContent } from '../constants/estadisticas.constant';
import { HORARIOS_COPY, type HorariosContent } from '../constants/horarios.constant';
import { INICIO_COPY, type InicioContent } from '../constants/inicio.constant';
import { INVERSIONES_COPY, type InversionesContent } from '../constants/inversiones.constant';
import {
  LICENCIAMIENTO_COPY,
  type LicenciamientoContent,
} from '../constants/licenciamiento.constant';
import { SERVICIOS_COPY, type ServiciosContent } from '../constants/servicios.constant';
import { TRANSPARENCIA_COPY, type TransparenciaContent } from '../constants/transparencia.constant';
import { REGLAMENTOS_COPY, type ReglamentosContent } from '../constants/reglamentos.constant';
import {
  PROCEDIMIENTOS_COPY,
  type ProcedimientosContent,
} from '../constants/procedimientos.constant';
import {
  PSICOPEDAGOGICO_COPY,
  SERVICIO_SOCIAL_COPY,
  SOPORTE_MEDICO_COPY,
  type PsicopedagogicoContent,
  type ServicioSocialContent,
  type SoporteMedicoContent,
} from '../constants/bienestar.constant';
import { RECLAMACIONES_COPY, type ReclamacionesContent } from '../constants/reclamaciones.constant';
import { PRIVACY_COPY, type PrivacyContent } from '../constants/legal.constant';
import { REPOSITORIO_COPY, type RepositorioCopy } from '../constants/repositorio.constant';
import type { ModuloId } from '../models/documento.model';
import { persisted, type PersistedStore } from './persisted-store';

export interface ContentByModulo {
  becas: BecasContent;
  costos: CostosContent;
  estadisticas: EstadisticasContent;
  horarios: HorariosContent;
  inversiones: InversionesContent;
  licenciamiento: LicenciamientoContent;
  admision: AdmissionContent;
  inicio: InicioContent;
  nosotros: AboutContent;
  servicios: ServiciosContent;
  transparencia: TransparenciaContent;
  reglamentos: ReglamentosContent;
  procedimientos: ProcedimientosContent;
  psicopedagogico: PsicopedagogicoContent;
  'servicio-social': ServicioSocialContent;
  'soporte-medico': SoporteMedicoContent;
  reclamaciones: ReclamacionesContent;
  privacidad: PrivacyContent;
  'repositorio-copy': RepositorioCopy;
}

export const CONTENT_KEYS: Record<ModuloId, string> = {
  becas: 'pc-content-becas',
  costos: 'pc-content-costos',
  estadisticas: 'pc-content-estadisticas',
  horarios: 'pc-content-horarios',
  inversiones: 'pc-content-inversiones',
  licenciamiento: 'pc-content-licenciamiento',
  admision: 'pc-content-admision',
  inicio: 'pc-content-inicio',
  nosotros: 'pc-content-nosotros',
  servicios: 'pc-content-servicios',
  transparencia: 'pc-content-transparencia',
  reglamentos: 'pc-content-reglamentos',
  procedimientos: 'pc-content-procedimientos',
  psicopedagogico: 'pc-content-psicopedagogico',
  'servicio-social': 'pc-content-servicio-social',
  'soporte-medico': 'pc-content-soporte-medico',
  reclamaciones: 'pc-content-reclamaciones',
  privacidad: 'pc-content-privacidad',
  'repositorio-copy': 'pc-content-repositorio-copy',
};

@Injectable({ providedIn: 'root' })
export class ContenidoStore {
  private readonly api = inject(PortalApi);

  readonly becas = persisted<BecasContent>(CONTENT_KEYS.becas, BECAS_COPY);
  readonly costos = persisted<CostosContent>(CONTENT_KEYS.costos, COSTOS_COPY);
  readonly estadisticas = persisted<EstadisticasContent>(
    CONTENT_KEYS.estadisticas,
    ESTADISTICAS_COPY,
  );
  readonly horarios = persisted<HorariosContent>(CONTENT_KEYS.horarios, HORARIOS_COPY);
  readonly inversiones = persisted<InversionesContent>(CONTENT_KEYS.inversiones, INVERSIONES_COPY);
  readonly licenciamiento = persisted<LicenciamientoContent>(
    CONTENT_KEYS.licenciamiento,
    LICENCIAMIENTO_COPY,
  );
  readonly admision = persisted<AdmissionContent>(
    CONTENT_KEYS.admision,
    ADMISSION_COPY,
    normalizarAdmision,
  );
  readonly inicio = persisted<InicioContent>(CONTENT_KEYS.inicio, INICIO_COPY);
  readonly nosotros = persisted<AboutContent>(
    CONTENT_KEYS.nosotros,
    ABOUT_COPY,
    normalizarNosotros,
  );
  readonly servicios = persisted<ServiciosContent>(CONTENT_KEYS.servicios, SERVICIOS_COPY);
  readonly transparencia = persisted<TransparenciaContent>(
    CONTENT_KEYS.transparencia,
    TRANSPARENCIA_COPY,
  );
  readonly reglamentos = persisted<ReglamentosContent>(CONTENT_KEYS.reglamentos, REGLAMENTOS_COPY);
  readonly procedimientos = persisted<ProcedimientosContent>(
    CONTENT_KEYS.procedimientos,
    PROCEDIMIENTOS_COPY,
  );
  readonly psicopedagogico = persisted<PsicopedagogicoContent>(
    CONTENT_KEYS.psicopedagogico,
    PSICOPEDAGOGICO_COPY,
  );
  readonly servicioSocial = persisted<ServicioSocialContent>(
    CONTENT_KEYS['servicio-social'],
    SERVICIO_SOCIAL_COPY,
  );
  readonly soporteMedico = persisted<SoporteMedicoContent>(
    CONTENT_KEYS['soporte-medico'],
    SOPORTE_MEDICO_COPY,
  );
  readonly reclamaciones = persisted<ReclamacionesContent>(
    CONTENT_KEYS.reclamaciones,
    RECLAMACIONES_COPY,
  );
  readonly privacidad = persisted<PrivacyContent>(CONTENT_KEYS.privacidad, PRIVACY_COPY);
  readonly repositorioCopy = persisted<RepositorioCopy>(
    CONTENT_KEYS['repositorio-copy'],
    REPOSITORIO_COPY,
  );

  de<K extends ModuloId>(modulo: K): PersistedStore<ContentByModulo[K]> {
    const stores = {
      becas: this.becas,
      costos: this.costos,
      estadisticas: this.estadisticas,
      horarios: this.horarios,
      inversiones: this.inversiones,
      licenciamiento: this.licenciamiento,
      admision: this.admision,
      inicio: this.inicio,
      nosotros: this.nosotros,
      servicios: this.servicios,
      transparencia: this.transparencia,
      reglamentos: this.reglamentos,
      procedimientos: this.procedimientos,
      psicopedagogico: this.psicopedagogico,
      'servicio-social': this.servicioSocial,
      'soporte-medico': this.soporteMedico,
      reclamaciones: this.reclamaciones,
      privacidad: this.privacidad,
      'repositorio-copy': this.repositorioCopy,
    };
    return stores[modulo] as unknown as PersistedStore<ContentByModulo[K]>;
  }

  aplicar<K extends ModuloId>(modulo: K, data: ContentByModulo[K]): void {
    this.de(modulo).set(this.preparar(modulo, data));
  }

  async publicar<K extends ModuloId>(modulo: K, data: ContentByModulo[K]): Promise<void> {
    const listo = this.preparar(modulo, data);
    this.de(modulo).set(listo);
    if (environment.useRemoteApi) {
      await this.api.guardarContenido(modulo, listo);
    }
  }

  /**
   * Devuelve un módulo al copy oficial. Con backend hay que pedírselo al
   * servidor: limpiar solo el navegador dejaba el cambio vivo para todos los
   * demás y volvía al recargar.
   */
  async restaurar<K extends ModuloId>(modulo: K): Promise<void> {
    if (environment.useRemoteApi) {
      const data = await this.api.restaurarContenido(modulo);
      this.aplicar(modulo, data);
      return;
    }
    this.de(modulo).reset();
  }

  private preparar<K extends ModuloId>(modulo: K, data: ContentByModulo[K]): ContentByModulo[K] {
    if (modulo === 'nosotros') {
      return normalizarNosotros(data) as ContentByModulo[K];
    }
    if (modulo === 'admision') {
      return normalizarAdmision(data) as ContentByModulo[K];
    }
    return data;
  }

  async resetAll(): Promise<void> {
    for (const modulo of Object.keys(CONTENT_KEYS) as ModuloId[]) {
      await this.restaurar(modulo);
    }
  }
}
