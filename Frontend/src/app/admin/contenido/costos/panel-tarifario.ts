import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type {
  InstitutionBankAccount,
  InstitutionFees,
} from '../../../core/constants/institution.constant';
import { CampoImagen } from '../../shared/campo-imagen/campo-imagen';
import { CampoRico } from '../../shared/campo-rico/campo-rico';
import { CampoTexto } from '../../shared/campo-texto/campo-texto';
import { SeccionBloque } from '../../shared/seccion-bloque/seccion-bloque';

const MONTOS: { key: keyof InstitutionFees; label: string }[] = [
  { key: 'admissionExam', label: 'Examen de admisión (S/)' },
  { key: 'enrollment', label: 'Matrícula (S/)' },
  { key: 'monthlyTuition', label: 'Pensión mensual (S/)' },
  { key: 'reinstatement', label: 'Reincorporación (S/)' },
];

@Component({
  selector: 'app-costos-panel-tarifario',
  standalone: true,
  imports: [CampoImagen, CampoRico, CampoTexto, SeccionBloque],
  template: `
    <app-seccion-bloque
      titulo="Montos vigentes"
      sub="Lo que el público ve en Admisión → Costos y pagos y en la página Costos. En soles, sin el símbolo."
    >
      <div class="montos">
        @for (monto of montos; track monto.key) {
          <app-campo-texto
            [label]="monto.label"
            tipo="number"
            placeholder="0"
            [valor]="textoMonto(fees()[monto.key])"
            (valorChange)="feeChange.emit({ key: monto.key, valor: $event })"
          />
        }
      </div>
    </app-seccion-bloque>

    <app-seccion-bloque
      titulo="Cuentas institucionales"
      sub="Banco, número, CCI y titular. Se copian desde Admisión y Costos."
      [cuenta]="accounts().length"
      cuentaSufijo="cuentas"
    >
      @if (accounts().length) {
        <div class="cuentas">
          @for (cuenta of accounts(); track $index) {
            <article class="cuenta">
              <header class="cuenta-head">
                <strong>{{ cuenta.bank.trim() || 'Cuenta nueva' }}</strong>
                <button
                  type="button"
                  class="btn-quitar"
                  (click)="pedirQuitarCuenta.emit($index)"
                >
                  <i class="fa fa-trash-can" aria-hidden="true"></i> Quitar
                </button>
              </header>
              <app-campo-texto
                label="Banco o nombre de la cuenta"
                placeholder="ejemplo: Banco de la Nación"
                [valor]="cuenta.bank"
                (valorChange)="accountChange.emit({ index: $index, campo: 'bank', valor: $event })"
              />
              <app-campo-texto
                label="Tipo de cuenta"
                placeholder="ejemplo: Cuenta Corriente"
                [valor]="cuenta.accountType"
                (valorChange)="
                  accountChange.emit({ index: $index, campo: 'accountType', valor: $event })
                "
              />
              <app-campo-texto
                label="Número de cuenta"
                placeholder="ejemplo: 04-040-299489"
                [valor]="cuenta.accountNumber"
                (valorChange)="
                  accountChange.emit({ index: $index, campo: 'accountNumber', valor: $event })
                "
              />
              <app-campo-texto
                label="CCI"
                placeholder="ejemplo: 018-000-004040299489-07"
                [valor]="cuenta.cci"
                (valorChange)="accountChange.emit({ index: $index, campo: 'cci', valor: $event })"
              />
              <app-campo-texto
                label="Titular"
                placeholder="Nombre de quien figura en la cuenta"
                [valor]="cuenta.holder"
                (valorChange)="accountChange.emit({ index: $index, campo: 'holder', valor: $event })"
              />
            </article>
          }
        </div>
      } @else {
        <p class="vacio">Todavía no hay cuentas. Agregue las que el instituto usa para pagos.</p>
      }
      <button type="button" class="btn-agregar" (click)="pedirAgregarCuenta.emit()">
        <i class="fa fa-plus" aria-hidden="true"></i> Agregar cuenta
      </button>
    </app-seccion-bloque>

    <app-seccion-bloque
      titulo="Tarifario"
      sub="Textos de la página Costos. Los montos de arriba son independientes de este texto."
    >
      <div class="tarjeta">
        <app-campo-texto
          label="Título de la página"
          placeholder="ejemplo: Costos"
          [valor]="heroTitle()"
          (valorChange)="heroTitleChange.emit($event)"
        />
        <app-campo-rico
          label="Nota legal"
          hint="El párrafo pequeño con la base legal que aparece arriba del tarifario."
          [valor]="legalRubric()"
          (valorChange)="legalRubricChange.emit($event)"
        />
        <app-campo-rico
          label="Texto del tarifario"
          hint="Explicación de los montos y de cómo debe hacerse el pago."
          [valor]="tarifarioLead()"
          (valorChange)="tarifarioLeadChange.emit($event)"
        />
        <app-campo-texto
          label="Enlace al tarifario oficial (PDF)"
          tipo="url"
          placeholder="Pegue aquí el enlace del PDF publicado"
          hint="Se usa como respaldo si no se sube un documento en esta sección."
          [valor]="tarifarioUrl()"
          (valorChange)="tarifarioUrlChange.emit($event)"
        />
      </div>
    </app-seccion-bloque>

    <app-seccion-bloque titulo="Imagen de portada" sub="Foto que acompaña al tarifario en la web.">
      <app-campo-imagen
        [referencia]="coverSrc()"
        [alt]="coverAlt()"
        etiquetaAlt="Descripción de la imagen (accesibilidad)"
        (referenciaChange)="coverSrcChange.emit($event)"
        (altChange)="coverAltChange.emit($event)"
        (pedirQuitar)="pedirQuitarCover.emit()"
      />
    </app-seccion-bloque>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 26px;
    }

    .montos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 14px;
    }

    .cuentas {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .cuenta,
    .tarjeta {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 18px;
      border: 1px solid var(--adm-line);
      border-radius: 14px;
      background: var(--adm-surface);
    }

    .cuenta-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .cuenta-head strong {
      font-size: 0.92rem;
    }

    .btn-quitar {
      all: unset;
      box-sizing: border-box;
      cursor: pointer;
      color: var(--adm-danger, #b42318);
      font-size: 0.8rem;
      font-weight: 650;
    }

    .btn-quitar:focus-visible {
      outline: 3px solid var(--adm-brand);
      outline-offset: 2px;
    }

    .btn-agregar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
      padding: 10px 14px;
      border: 1px dashed var(--adm-line);
      border-radius: 10px;
      background: var(--adm-bg);
      color: var(--adm-ink);
      font: inherit;
      font-size: 0.88rem;
      font-weight: 650;
      cursor: pointer;
    }

    .vacio {
      margin: 0;
      padding: 22px;
      border: 1px dashed var(--adm-line);
      border-radius: 12px;
      background: var(--adm-bg);
      color: var(--adm-ink-soft);
      font-size: 0.85rem;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostosPanelTarifario {
  readonly montos = MONTOS;

  readonly fees = input.required<InstitutionFees>();
  readonly accounts = input.required<InstitutionBankAccount[]>();
  readonly heroTitle = input.required<string>();
  readonly legalRubric = input.required<string>();
  readonly tarifarioLead = input.required<string>();
  readonly tarifarioUrl = input.required<string>();
  readonly coverSrc = input.required<string>();
  readonly coverAlt = input.required<string>();

  readonly feeChange = output<{ key: keyof InstitutionFees; valor: string }>();
  readonly accountChange = output<{
    index: number;
    campo: keyof InstitutionBankAccount;
    valor: string;
  }>();
  readonly pedirAgregarCuenta = output<void>();
  readonly pedirQuitarCuenta = output<number>();
  readonly heroTitleChange = output<string>();
  readonly legalRubricChange = output<string>();
  readonly tarifarioLeadChange = output<string>();
  readonly tarifarioUrlChange = output<string>();
  readonly coverSrcChange = output<string>();
  readonly coverAltChange = output<string>();
  readonly pedirQuitarCover = output<void>();

  textoMonto(valor: number): string {
    return Number.isFinite(valor) ? String(valor) : '';
  }
}
