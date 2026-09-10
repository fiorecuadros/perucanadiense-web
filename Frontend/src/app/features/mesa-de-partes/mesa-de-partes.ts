import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstitutionService } from '../../core/services/institution.service';
import { IntakeService } from '../../core/services/intake.service';
import {
  INTAKE_CONDITIONS,
  INTAKE_DOC_TYPES,
  IntakeRecord,
  IntakeSubmitResult,
} from '../../core/models/intake.model';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  DialogComponent,
  InputDirective,
} from '../../shared/ui';

const FILE_MAX_BYTES = 10 * 1024 * 1024;

@Component({
  selector: 'app-mesa-de-partes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHero,
    AlertComponent,
    BadgeComponent,
    ButtonDirective,
    DialogComponent,
    InputDirective,
  ],
  templateUrl: './mesa-de-partes.html',
  styleUrl: './mesa-de-partes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesaDePartes {
  private readonly fb = inject(FormBuilder);
  private readonly institution = inject(InstitutionService);
  private readonly intake = inject(IntakeService);

  readonly info = this.institution.info;
  readonly conditions = INTAKE_CONDITIONS;
  readonly docTypes = INTAKE_DOC_TYPES;

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly success = signal<IntakeSubmitResult | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly captchaCode = signal(this.randomCaptcha());
  readonly captchaError = signal('');
  readonly showTracking = signal(false);
  readonly trackingCode = signal('');
  readonly trackingError = signal<string | null>(null);
  readonly trackingResult = signal<IntakeRecord | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(5)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8,11}$/)]],
    telefono: ['', [Validators.required, Validators.minLength(7)]],
    correo: ['', [Validators.required, Validators.email]],
    condicion: ['', Validators.required],
    tipoDoc: ['', Validators.required],
    folios: [1, [Validators.required, Validators.min(1)]],
    asunto: ['', [Validators.required, Validators.maxLength(150)]],
    mensaje: [''],
    linkDocumento: [''],
    captcha: ['', Validators.required],
  });

  invalid(control: keyof typeof this.form.controls): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || field.dirty);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && file.size > FILE_MAX_BYTES) {
      this.submitError.set('El archivo no puede superar 10 MB.');
      input.value = '';
      this.selectedFile.set(null);
      return;
    }
    this.submitError.set(null);
    this.selectedFile.set(file);
  }

  clearFile(): void {
    this.selectedFile.set(null);
  }

  refreshCaptcha(): void {
    this.captchaCode.set(this.randomCaptcha());
    this.form.controls.captcha.setValue('');
    this.captchaError.set('');
  }

  async enviar(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.submitError.set('Revise los campos marcados antes de enviar.');
      return;
    }
    if (this.form.controls.captcha.value.trim() !== this.captchaCode()) {
      this.captchaError.set('El código de verificación no coincide.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);
    try {
      const value = this.form.getRawValue();
      const result = await this.intake.submit(
        {
          nombres: value.nombres,
          dni: value.dni,
          telefono: value.telefono,
          correo: value.correo,
          condicion: value.condicion as (typeof INTAKE_CONDITIONS)[number],
          tipoDoc: value.tipoDoc as (typeof INTAKE_DOC_TYPES)[number],
          folios: value.folios,
          asunto: value.asunto,
          mensaje: value.mensaje,
          fileName: this.selectedFile()?.name,
          linkDocumento: value.linkDocumento || undefined,
        },
        this.selectedFile(),
      );
      this.success.set(result);
      this.form.reset({ folios: 1 });
      this.selectedFile.set(null);
      this.refreshCaptcha();
    } catch {
      this.submitError.set(
        'No se pudo registrar el trámite. Inténtelo de nuevo o escriba a mesa de partes.',
      );
    } finally {
      this.submitting.set(false);
    }
  }

  async consultar(): Promise<void> {
    const code = this.trackingCode().trim();
    if (!code) {
      this.trackingError.set('Ingrese su código de seguimiento.');
      return;
    }
    const found = await this.intake.trackRemote(code);
    if (!found) {
      this.trackingResult.set(null);
      this.trackingError.set('No hay un trámite con ese código.');
      return;
    }
    this.trackingError.set(null);
    this.trackingResult.set(found);
  }

  statusLabel(status: IntakeRecord['status']): string {
    const labels = {
      pendiente: 'Pendiente',
      recibido: 'Recibido',
      en_tramite: 'En trámite',
      finalizado: 'Finalizado',
    };
    return labels[status];
  }

  private randomCaptcha(): string {
    return String(Math.floor(10000 + Math.random() * 90000));
  }
}
