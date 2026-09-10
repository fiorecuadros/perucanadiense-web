import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../core/services/institution.service';
import { PortalApi } from '../../core/api/portal.api';
import { ContenidoStore } from '../../core/store/contenido.store';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Breadcrumbs } from '../../shared/components/breadcrumbs/breadcrumbs';
import { ButtonDirective, InputDirective } from '../../shared/ui';

@Component({
  selector: 'app-transparencia',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHero,
    Breadcrumbs,
    ButtonDirective,
    InputDirective,
  ],
  templateUrl: './transparencia.component.html',
  styleUrls: ['../../shared/styles/service-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransparenciaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly institution = inject(InstitutionService);
  private readonly api = inject(PortalApi);

  readonly info = this.institution.info;
  readonly copy = inject(ContenidoStore).transparencia.value;
  readonly rubros = computed(() => this.copy().rubros);
  readonly crumbs = [{ label: 'Inicio', link: '/inicio' }, { label: 'Transparencia' }];
  readonly codigo = signal<string | null>(null);
  readonly director = computed(() =>
    this.institution.faculty().find((member) => member.position === 'Director General'),
  );

  readonly form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(3)]],
    apellidos: ['', [Validators.required, Validators.minLength(3)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    direccion: ['', [Validators.required, Validators.minLength(10)]],
    informacionSolicitada: ['', [Validators.required, Validators.minLength(20)]],
    motivo: ['', [Validators.required, Validators.minLength(10)]],
    aceptoPrivacidad: [false, Validators.requiredTrue],
  });

  invalid(control: keyof typeof this.form.controls): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || field.dirty);
  }

  async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { aceptoPrivacidad: _, ...body } = this.form.getRawValue();
    const res = await this.api.registrarAcceso(body);
    this.codigo.set(res.codigo);
  }

  mailtoHref(code: string): string {
    const value = this.form.getRawValue();
    const body = [
      `Código: ${code}`,
      `Nombre: ${value.nombres} ${value.apellidos}`,
      `DNI: ${value.dni}`,
      `Teléfono: ${value.telefono}`,
      `Dirección: ${value.direccion}`,
      `Información solicitada: ${value.informacionSolicitada}`,
      `Motivo: ${value.motivo}`,
    ].join('\n');
    return `mailto:${this.info().contact.emailGeneral}?subject=${encodeURIComponent('Solicitud de acceso a la información ' + code)}&body=${encodeURIComponent(body)}`;
  }

  reset(): void {
    this.form.reset();
    this.codigo.set(null);
  }
}
