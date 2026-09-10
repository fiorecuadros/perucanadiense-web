import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PortalApi } from '../../core/api/portal.api';
import { InstitutionService } from '../../core/services/institution.service';
import { ToastService } from '../shared/toast/toast';

interface Sede {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  country: string;
  reference: string;
}

interface Ficha {
  name: string;
  shortName: string;
  acronym: string;
  slogan: string;
  tagline: string;
  ruc: string;
  modularCode: string;
  legalDecree: string;
  licensingNorm: string;
  governingBody: string;
  regionalOffice: string;
  ugel: string;
  yearsOfExperience: number;
  locations: Sede[];
  contact: {
    landline: string;
    phoneFormatted: string;
    whatsapp: string;
    whatsappFormatted: string;
    whatsappMessage: string;
    emailGeneral: string;
    emailIntake: string;
    emailAdmin: string;
  };
  schedule: { attention: string; classesPresential: string };
  social: { facebook: string; youtube: string; instagram: string; linkedin: string };
  [clave: string]: unknown;
}

type Pestana = 'identidad' | 'contacto' | 'sedes' | 'redes';

const SEDE_VACIA: Sede = {
  id: '',
  name: '',
  address: '',
  city: 'Chiclayo',
  region: 'Lambayeque',
  country: 'Perú',
  reference: '',
};

/**
 * Editor de la ficha institucional: identidad legal, contacto, sedes, horarios y
 * redes. Es lo que el portal público muestra en la cabecera, el pie, la página
 * de contacto y el botón de WhatsApp.
 */
@Component({
  selector: 'app-admin-contactos',
  standalone: true,
  templateUrl: './contactos.component.html',
  styleUrl: './contactos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContactosComponent {
  private readonly api = inject(PortalApi);
  private readonly institucion = inject(InstitutionService);
  private readonly toast = inject(ToastService);

  readonly pestana = signal<Pestana>('contacto');
  readonly ficha = signal<Ficha | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  readonly pestanas: { id: Pestana; label: string }[] = [
    { id: 'identidad', label: 'Identidad legal' },
    { id: 'contacto', label: 'Contacto' },
    { id: 'sedes', label: 'Sedes' },
    { id: 'redes', label: 'Redes y horarios' },
  ];

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const datos = (await this.api.institucion()) as unknown as Ficha;
      this.ficha.set({ ...datos, locations: [...(datos.locations ?? [])] });
    } catch {
      this.error.set('No se pudo leer la ficha institucional.');
    } finally {
      this.cargando.set(false);
    }
  }

  campo(clave: keyof Ficha): string {
    const valor = this.ficha()?.[clave];
    return valor === undefined || valor === null ? '' : String(valor);
  }

  patch(clave: string, valor: string | number): void {
    this.ficha.update((actual) => (actual ? { ...actual, [clave]: valor } : actual));
  }

  patchContacto(clave: keyof Ficha['contact'], valor: string): void {
    this.ficha.update((actual) =>
      actual ? { ...actual, contact: { ...actual.contact, [clave]: valor } } : actual,
    );
  }

  patchHorario(clave: keyof Ficha['schedule'], valor: string): void {
    this.ficha.update((actual) =>
      actual ? { ...actual, schedule: { ...actual.schedule, [clave]: valor } } : actual,
    );
  }

  patchRed(clave: keyof Ficha['social'], valor: string): void {
    this.ficha.update((actual) =>
      actual ? { ...actual, social: { ...actual.social, [clave]: valor } } : actual,
    );
  }

  patchSede(indice: number, clave: keyof Sede, valor: string): void {
    this.ficha.update((actual) => {
      if (!actual) return actual;
      const locations = actual.locations.map((sede, i) =>
        i === indice ? { ...sede, [clave]: valor } : sede,
      );
      return { ...actual, locations };
    });
  }

  agregarSede(): void {
    this.ficha.update((actual) =>
      actual
        ? {
            ...actual,
            locations: [...actual.locations, { ...SEDE_VACIA, id: `sede-${Date.now()}` }],
          }
        : actual,
    );
  }

  quitarSede(indice: number): void {
    this.ficha.update((actual) =>
      actual ? { ...actual, locations: actual.locations.filter((_, i) => i !== indice) } : actual,
    );
  }

  async guardar(): Promise<void> {
    const ficha = this.ficha();
    if (!ficha) return;
    if (!ficha.contact.emailGeneral.trim()) {
      this.toast.error('El correo institucional no puede quedar vacío.');
      return;
    }
    this.guardando.set(true);
    try {
      const guardada = (await this.api.guardarInstitucion(
        ficha as unknown as Record<string, unknown>,
      )) as unknown as Ficha;
      this.ficha.set(guardada);
      // El portal público lee de este servicio: se refleja sin recargar.
      this.institucion.aplicarFicha(guardada as never);
      this.toast.success('Ficha institucional actualizada en el portal.');
    } catch {
      this.toast.error('No se pudo guardar la ficha.');
    } finally {
      this.guardando.set(false);
    }
  }
}
