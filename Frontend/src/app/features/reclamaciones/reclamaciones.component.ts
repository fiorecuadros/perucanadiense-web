import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../core/services/institution.service';
import { PortalApi } from '../../core/api/portal.api';
import { ContenidoStore } from '../../core/store/contenido.store';
import {
  TIPOS_DOCUMENTO_RECLAMO,
  TIPOS_RECLAMO,
} from '../../core/constants/reclamaciones.constant';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Breadcrumbs } from '../../shared/components/breadcrumbs/breadcrumbs';
import { ButtonDirective, InputDirective } from '../../shared/ui';

function etiquetas(lista: unknown, respaldo: readonly string[]): string[] {
  const limpios = (Array.isArray(lista) ? lista : [])
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  return limpios.length ? limpios : [...respaldo];
}

@Component({
  selector: 'app-reclamaciones',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHero,
    Breadcrumbs,
    ButtonDirective,
    InputDirective,
  ],
  templateUrl: './reclamaciones.component.html',
  styleUrls: ['../../shared/styles/service-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReclamacionesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly institution = inject(InstitutionService);
  private readonly api = inject(PortalApi);

  readonly info = this.institution.info;
  readonly copy = inject(ContenidoStore).reclamaciones.value;
  readonly pasos = computed(() => this.copy().pasos);
  readonly tiposDocumento = computed(() => etiquetas(this.copy().tiposDocumento, TIPOS_DOCUMENTO_RECLAMO));
  readonly tiposReclamo = computed(() => etiquetas(this.copy().tiposReclamo, TIPOS_RECLAMO));
  readonly crumbs = [
    { label: 'Inicio', link: '/inicio' },
    { label: 'Servicios', link: '/servicios' },
    { label: 'Reclamaciones' },
  ];
  readonly codigo = signal<string | null>(null);
  readonly enviando = signal(false);
  readonly errorEnvio = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    tipoDocumento: ['', Validators.required],
    numeroDocumento: ['', [Validators.required, Validators.pattern(/^\d{8,12}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(3)]],
    apellidos: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
    direccion: ['', [Validators.required, Validators.minLength(10)]],
    // Hoja INDECOPI (Ley 29571): el backend exige ambos campos.
    tipoBien: ['', Validators.required],
    descripcionBien: ['', [Validators.required, Validators.minLength(3)]],
    tipoReclamo: ['', Validators.required],
    detalleReclamo: ['', [Validators.required, Validators.minLength(20)]],
    pedido: ['', [Validators.required, Validators.minLength(10)]],
    aceptoPrivacidad: [false, Validators.requiredTrue],
  });

  invalid(control: keyof typeof this.form.controls): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || field.dirty);
  }

  async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorEnvio.set('Revise los campos marcados antes de enviar.');
      return;
    }
    this.enviando.set(true);
    this.errorEnvio.set(null);
    try {
      const { aceptoPrivacidad: _, ...body } = this.form.getRawValue();
      const res = await this.api.registrarReclamo(body);
      this.codigo.set(res.codigo);
    } catch (err) {
      const mensaje =
        err instanceof HttpErrorResponse && err.error && typeof err.error.message === 'string'
          ? err.error.message
          : 'No se pudo registrar el reclamo. Inténtelo de nuevo o escriba a informes.';
      this.errorEnvio.set(mensaje);
    } finally {
      this.enviando.set(false);
    }
  }

  reset(): void {
    this.form.reset();
    this.codigo.set(null);
    this.errorEnvio.set(null);
  }
}
