import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InstitutionService } from '../../core/services/institution.service';
import { PortalApi } from '../../core/api/portal.api';
import { CICLOS_ACADEMICOS } from '../../core/constants/bienestar.constant';
import { ContenidoStore } from '../../core/store/contenido.store';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { Breadcrumbs } from '../../shared/components/breadcrumbs/breadcrumbs';
import { ButtonDirective, InputDirective } from '../../shared/ui';

@Component({
  selector: 'app-servicio-social',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHero,
    Breadcrumbs,
    ButtonDirective,
    InputDirective,
  ],
  templateUrl: './servicio-social.component.html',
  styleUrls: ['../../shared/styles/service-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicioSocialComponent {
  private readonly fb = inject(FormBuilder);
  private readonly institution = inject(InstitutionService);
  private readonly api = inject(PortalApi);

  readonly info = this.institution.info;
  readonly copy = inject(ContenidoStore).servicioSocial.value;
  readonly servicios = computed(() => this.copy().servicios);
  readonly programas = this.institution.programs;
  readonly ciclos = CICLOS_ACADEMICOS;
  readonly tiposApoyo = computed(() => this.copy().tiposApoyo);
  readonly crumbs = [
    { label: 'Inicio', link: '/inicio' },
    { label: 'Servicios', link: '/servicios' },
    { label: 'Servicio social' },
  ];
  readonly codigo = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(3)]],
    apellidos: ['', [Validators.required, Validators.minLength(3)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    programa: ['', Validators.required],
    semestre: ['', Validators.required],
    tipoApoyo: ['', Validators.required],
    descripcionSituacion: ['', [Validators.required, Validators.minLength(20)]],
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
    const res = await this.api.registrarApoyo(body);
    this.codigo.set(res.codigo);
  }

  mailtoHref(code: string): string {
    const value = this.form.getRawValue();
    const body = [
      `Código: ${code}`,
      `Nombre: ${value.nombres} ${value.apellidos}`,
      `DNI: ${value.dni}`,
      `Programa: ${value.programa}`,
      `Apoyo: ${value.tipoApoyo}`,
      `Situación: ${value.descripcionSituacion}`,
    ].join('\n');
    return `mailto:${this.info().contact.emailGeneral}?subject=${encodeURIComponent('Solicitud de servicio social ' + code)}&body=${encodeURIComponent(body)}`;
  }

  reset(): void {
    this.form.reset();
    this.codigo.set(null);
  }

  lineas(texto?: string): string[] {
    return texto
      ? texto
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }
}
