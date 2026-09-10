import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PortalApi } from '../../../core/api/portal.api';
import type { InstitucionFicha } from '../../../core/api/api.types';
import {
  INSTITUTION,
  type InstitutionBankAccount,
  type InstitutionFees,
} from '../../../core/constants/institution.constant';
import { InstitutionService } from '../../../core/services/institution.service';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorModuloMarco, type MarcoTab } from '../../shared/editor-modulo/editor-modulo-marco';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';
import { TablaDocumentos } from '../../shared/tabla-documentos/tabla-documentos';
import { CostosPanelMatricula } from './panel-matricula';
import { CostosPanelTarifario } from './panel-tarifario';

const TABS: MarcoTab[] = [
  { id: 'tarifario', label: 'Tarifario' },
  { id: 'matricula', label: 'Matrícula' },
  { id: 'consultas', label: 'Consultas' },
];

const CUENTA_VACIA: InstitutionBankAccount = {
  bank: '',
  accountType: '',
  accountNumber: '',
  cci: '',
  holder: '',
};

function clonarFees(origen: InstitutionFees): InstitutionFees {
  return {
    admissionExam: Number(origen.admissionExam) || 0,
    enrollment: Number(origen.enrollment) || 0,
    monthlyTuition: Number(origen.monthlyTuition) || 0,
    reinstatement: Number(origen.reinstatement) || 0,
  };
}

function clonarCuentas(lista: readonly InstitutionBankAccount[]): InstitutionBankAccount[] {
  return lista.map((cuenta) => ({ ...cuenta }));
}

function aMonto(texto: string): number {
  const n = Number(String(texto).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

@Component({
  selector: 'app-admin-costos',
  standalone: true,
  imports: [
    EditorModuloMarco,
    SeccionBloque,
    TablaDocumentos,
    CostosPanelTarifario,
    CostosPanelMatricula,
  ],
  template: `
    <app-editor-modulo-marco
      [editor]="this"
      titulo="Costos"
      sub="Los montos y las cuentas se publican en /costos y en Admisión → Costos y pagos."
      publicPath="/costos"
      [tabs]="tabs"
      [(activa)]="activa"
    >
      @switch (activa()) {
        @case ('tarifario') {
          <app-costos-panel-tarifario
            [fees]="fees()"
            [accounts]="accounts()"
            [heroTitle]="draft().heroTitle"
            [legalRubric]="draft().legalRubric"
            [tarifarioLead]="draft().tarifarioLead"
            [tarifarioUrl]="draft().tarifarioUrl"
            [coverSrc]="draft().cover.src"
            [coverAlt]="draft().cover.alt"
            (feeChange)="parcheFee($event.key, $event.valor)"
            (accountChange)="parcheCuenta($event.index, $event.campo, $event.valor)"
            (pedirAgregarCuenta)="agregarCuenta()"
            (pedirQuitarCuenta)="confirmarQuitarCuenta($event)"
            (heroTitleChange)="parche({ heroTitle: $event })"
            (legalRubricChange)="parche({ legalRubric: $event })"
            (tarifarioLeadChange)="parche({ tarifarioLead: $event })"
            (tarifarioUrlChange)="parche({ tarifarioUrl: $event })"
            (coverSrcChange)="parcheCover('src', $event)"
            (coverAltChange)="parcheCover('alt', $event)"
            (pedirQuitarCover)="confirmarQuitarCover()"
          />
        }
        @case ('matricula') {
          <app-costos-panel-matricula
            [matriculaLead]="draft().matriculaLead"
            [paymentStepsText]="draft().paymentStepsText"
            [reinstatementNote]="draft().reinstatementNote"
            [futLabel]="draft().futLabel"
            [futUrl]="draft().futUrl"
            [imagenSrc]="draft().matriculaImage.src"
            [imagenAlt]="draft().matriculaImage.alt"
            (matriculaLeadChange)="parche({ matriculaLead: $event })"
            (paymentStepsTextChange)="parche({ paymentStepsText: $event })"
            (reinstatementNoteChange)="parche({ reinstatementNote: $event })"
            (futLabelChange)="parche({ futLabel: $event })"
            (futUrlChange)="parche({ futUrl: $event })"
            (imagenSrcChange)="parcheMatriculaImagen('src', $event)"
            (imagenAltChange)="parcheMatriculaImagen('alt', $event)"
            (pedirQuitarImagen)="confirmarQuitarMatriculaImagen()"
          />
        }
        @case ('consultas') {
          <app-seccion-bloque
            titulo="Consultas de pagos"
            sub="Esta pestaña muestra los datos de contacto para informes de pagos (WhatsApp, teléfono y correo). Esos datos se editan en «Contactos & Sedes»; aquí solo puede adjuntar documentos de apoyo."
          >
            <p class="nota">No hay textos que editar en esta pestaña.</p>
          </app-seccion-bloque>
        }
      }

      <div extra>
        <app-tabla-documentos modulo="costos" [seccion]="activa()" />
      </div>
    </app-editor-modulo-marco>
  `,
  styles: `
    .nota {
      margin: 0;
      padding: 16px 18px;
      border: 1px dashed var(--adm-line);
      border-radius: 12px;
      background: var(--adm-bg);
      color: var(--adm-ink-soft);
      font-size: 0.85rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCostos extends EditorModuloBase<'costos'> {
  private readonly api = inject(PortalApi);
  private readonly institucion = inject(InstitutionService);

  protected readonly moduloId = 'costos' as const;
  protected override mensajeGuardado =
    'Los cambios ya están publicados en Costos y en Admisión → Costos y pagos.';

  readonly tabs = TABS;
  readonly activa = signal('tarifario');
  readonly fees = signal<InstitutionFees>(clonarFees(INSTITUTION.fees));
  readonly accounts = signal<InstitutionBankAccount[]>(clonarCuentas(INSTITUTION.bankAccounts));

  private fichaViva: InstitucionFicha = {};
  private snapshotPagos = '';

  constructor() {
    super();
    void this.cargarFicha();
  }

  override dirty(): boolean {
    return super.dirty() || this.pagosDirty();
  }

  override cancelar(): void {
    super.cancelar();
    this.restaurarPagos();
  }

  override async guardar(): Promise<void> {
    if (!this.dirty() || this.guardando()) return;
    this.guardando.set(true);
    try {
      if (super.dirty()) {
        await this.contenido.publicar(this.moduloId, structuredClone(this.draft()));
        this.snapshot = JSON.stringify(this.draft());
      }
      if (this.pagosDirty()) {
        const guardada = await this.api.guardarInstitucion({
          ...this.fichaViva,
          fees: this.fees(),
          bankAccounts: this.accounts(),
        });
        this.fichaViva = { ...guardada };
        this.institucion.aplicarFicha(guardada as never);
        this.marcarPagosLimpios();
      }
      this.guardado.set(true);
      this.toast.success(this.mensajeGuardado);
    } catch {
      this.toast.error(
        'No se pudieron guardar los cambios. Revise la conexión e intente de nuevo.',
      );
    } finally {
      this.guardando.set(false);
    }
  }

  parcheFee(clave: keyof InstitutionFees, valor: string): void {
    this.fees.update((actual) => ({ ...actual, [clave]: aMonto(valor) }));
    this.guardado.set(false);
  }

  parcheCuenta(index: number, campo: keyof InstitutionBankAccount, valor: string): void {
    this.accounts.update((lista) =>
      lista.map((cuenta, i) => (i === index ? { ...cuenta, [campo]: valor } : cuenta)),
    );
    this.guardado.set(false);
  }

  agregarCuenta(): void {
    this.accounts.update((lista) => [...lista, { ...CUENTA_VACIA }]);
    this.guardado.set(false);
  }

  confirmarQuitarCuenta(index: number): void {
    const nombre = this.accounts()[index]?.bank?.trim();
    this.pedirConfirmacion({
      titulo: 'Quitar cuenta institucional',
      detalle: nombre
        ? `Se quitará la cuenta «${nombre}» del portal.`
        : 'Se quitará esta cuenta del portal.',
      accion: () => {
        this.accounts.update((lista) => lista.filter((_, i) => i !== index));
        this.guardado.set(false);
      },
    });
  }

  parcheCover(campo: 'src' | 'alt', valor: string): void {
    this.parche({ cover: { ...this.draft().cover, [campo]: valor } });
  }

  parcheMatriculaImagen(campo: 'src' | 'alt', valor: string): void {
    this.parche({ matriculaImage: { ...this.draft().matriculaImage, [campo]: valor } });
  }

  confirmarQuitarCover(): void {
    this.pedirConfirmacion({
      titulo: 'Quitar imagen de portada',
      detalle: 'El tarifario quedará sin imagen de portada hasta que suba una nueva.',
      accion: () => this.parche({ cover: { src: '', alt: '' } }),
    });
  }

  confirmarQuitarMatriculaImagen(): void {
    this.pedirConfirmacion({
      titulo: 'Quitar imagen de matrícula',
      detalle: 'El proceso de matrícula quedará sin imagen hasta que suba una nueva.',
      accion: () => this.parche({ matriculaImage: { src: '', alt: '' } }),
    });
  }

  private pagosDirty(): boolean {
    return JSON.stringify({ fees: this.fees(), accounts: this.accounts() }) !== this.snapshotPagos;
  }

  private marcarPagosLimpios(): void {
    this.snapshotPagos = JSON.stringify({ fees: this.fees(), accounts: this.accounts() });
  }

  private restaurarPagos(): void {
    const ficha = this.fichaViva;
    const fees = (ficha['fees'] as InstitutionFees | undefined) ?? INSTITUTION.fees;
    const cuentas = Array.isArray(ficha['bankAccounts'])
      ? (ficha['bankAccounts'] as InstitutionBankAccount[])
      : INSTITUTION.bankAccounts;
    this.fees.set(clonarFees(fees));
    this.accounts.set(clonarCuentas(cuentas));
    this.marcarPagosLimpios();
  }

  private async cargarFicha(): Promise<void> {
    try {
      const ficha = await this.api.institucion();
      this.fichaViva = { ...ficha };
      const fees = (ficha['fees'] as InstitutionFees | undefined) ?? INSTITUTION.fees;
      const cuentas = Array.isArray(ficha['bankAccounts'])
        ? (ficha['bankAccounts'] as InstitutionBankAccount[])
        : INSTITUTION.bankAccounts;
      this.fees.set(clonarFees(fees));
      this.accounts.set(clonarCuentas(cuentas));
    } catch {
      this.fichaViva = { ...INSTITUTION } as unknown as InstitucionFicha;
      this.fees.set(clonarFees(INSTITUTION.fees));
      this.accounts.set(clonarCuentas(INSTITUTION.bankAccounts));
    }
    this.marcarPagosLimpios();
  }
}
