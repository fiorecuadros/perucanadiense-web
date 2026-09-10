import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../api/portal.api';
import { INSTITUTION } from '../constants/institution.constant';
import {
  ACADEMIC_PROGRAMS,
  PROGRAM_LEVELS,
  programsByLevel,
  type Program,
} from '../constants/programs.constant';
import { FacultyStore } from '../store/faculty.store';

type Institucion = typeof INSTITUTION;

@Injectable({
  providedIn: 'root',
})
export class InstitutionService {
  private readonly facultyStore = inject(FacultyStore);
  private readonly api = inject(PortalApi);
  private institutionData = signal<Institucion>(INSTITUTION);
  private programsData = signal<Program[]>(ACADEMIC_PROGRAMS);

  readonly info = this.institutionData.asReadonly();
  readonly programs = this.programsData.asReadonly();
  readonly faculty = this.facultyStore.lista;

  readonly fidPrograms = computed(() => programsByLevel(this.programsData(), 'FID'));

  readonly technicalPrograms = computed(() => programsByLevel(this.programsData(), 'Técnica'));

  readonly continuaPrograms = computed(() =>
    programsByLevel(this.programsData(), 'Formación Continua'),
  );

  readonly nivelesConOferta = computed(() =>
    PROGRAM_LEVELS.filter((nivel) => programsByLevel(this.programsData(), nivel).length > 0),
  );

  readonly authorities = computed(() => this.faculty().filter((f) => f.type === 'Autoridad'));

  readonly administrative = computed(() =>
    this.faculty().filter((f) => f.type === 'Administrativo'),
  );

  readonly teachers = computed(() => this.faculty().filter((f) => f.type === 'Docente'));

  readonly whatsappUrl = computed(() => {
    const phone = this.institutionData().contact.whatsapp;
    const msg = encodeURIComponent(this.institutionData().contact.whatsappMessage);
    return `https://wa.me/+51${phone}?text=${msg}`;
  });

  getProgramById(id: string): Program | undefined {
    return this.programsData().find((p) => p.id === id);
  }

  /**
   * Trae la ficha institucional y la oferta desde el API. Se fusiona sobre la
   * constante para que un campo que el servidor aún no tenga conserve el dato
   * oficial en vez de quedar vacío en el portal.
   */
  async hidratar(): Promise<void> {
    if (!environment.useRemoteApi) return;
    await Promise.allSettled([
      (async () => {
        const ficha = await this.api.institucion();
        if (ficha && typeof ficha === 'object') {
          this.aplicarFicha(ficha as Partial<Institucion>);
        }
      })(),
      (async () => {
        const programas = await this.api.programas();
        if (Array.isArray(programas) && programas.length) this.programsData.set(programas);
      })(),
    ]);
  }

  /** Aplica en caliente lo que el panel acaba de guardar, sin recargar la página. */
  aplicarFicha(ficha: Partial<Institucion>): void {
    const actual = this.institutionData();
    const tarifas = (ficha.fees ?? actual.fees) as Institucion['fees'];
    const cuentas = Array.isArray(ficha.bankAccounts) ? ficha.bankAccounts : actual.bankAccounts;
    this.institutionData.set({
      ...INSTITUTION,
      ...actual,
      ...ficha,
      fees: { ...INSTITUTION.fees, ...tarifas },
      bankAccounts: cuentas,
    } as Institucion);
  }

  aplicarProgramas(lista: Program[]): void {
    this.programsData.set(lista);
  }
}
