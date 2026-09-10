import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { InstitutionService } from '../../core/services/institution.service';
import { ButtonDirective, InputDirective } from '../../shared/ui';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonDirective, InputDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly remoto = environment.useRemoteApi;
  readonly error = signal<string | null>(null);
  readonly enviando = signal(false);
  readonly verClave = signal(false);

  /** Nombre del instituto para el alt del logo, sin acoplarse a un literal. */
  readonly institucion = inject(InstitutionService).info;

  alternarClave(): void {
    this.verClave.update((visible) => !visible);
  }

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  /** Un campo solo muestra su error cuando ya se tocó y quedó inválido. */
  mostrarError(campo: 'username' | 'password'): boolean {
    const control = this.form.controls[campo];
    return control.touched && control.invalid;
  }

  async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    try {
      const { username, password } = this.form.getRawValue();
      await this.auth.login(username, password);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } catch {
      this.error.set(
        'No pudimos iniciar sesión. Verifica tu usuario y contraseña e inténtalo de nuevo.',
      );
    } finally {
      this.enviando.set(false);
    }
  }
}
