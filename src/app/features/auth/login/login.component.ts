import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Divider } from 'primeng/divider';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Card,
    Button,
    InputText,
    Password,
    Message,
    Divider,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="shell">
      <p-card styleClass="login-card">
        <div class="brand">
          <h1>Neko CRM</h1>
          <p class="sub">Gestión comercial de clientes</p>
        </div>

        @if (authError()) {
          <p-message severity="error" [text]="authError()!" styleClass="w-full mb-3" />
        }

        @if (loading()) {
          <app-loading-spinner message="Ingresando..." [overlay]="false" />
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label for="email">Email</label>
              <input id="email" type="email" pInputText fluid formControlName="email" autocomplete="username" />
              @if (form.controls.email.touched && form.controls.email.errors?.['required']) {
                <small class="err">El email es obligatorio</small>
              }
              @if (form.controls.email.touched && form.controls.email.errors?.['email']) {
                <small class="err">Ingresá un email válido</small>
              }
            </div>
            <div class="field">
              <label for="password">Contraseña</label>
              <p-password
                inputId="password"
                formControlName="password"
                [feedback]="false"
                [toggleMask]="true"
                [fluid]="true"
                autocomplete="current-password"
              />
              @if (form.controls.password.touched && form.controls.password.errors?.['required']) {
                <small class="err">La contraseña es obligatoria</small>
              }
            </div>
            <p-button type="submit" label="Ingresar" styleClass="w-full mt-2" [fluid]="true" />
          </form>
        }

        <p-divider align="center">
          <span class="demo-label">Credenciales demo</span>
        </p-divider>
        <div class="demo">
          <p><strong>Email:</strong> admin&#64;crm.com</p>
          <p><strong>Contraseña:</strong> 123456</p>
        </div>
      </p-card>
    </div>
  `,
  styles: `
    .shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: linear-gradient(
        160deg,
        var(--p-primary-50, #eef2ff) 0%,
        var(--p-surface-0, #fff) 45%,
        var(--p-surface-100, #f4f4f5) 100%
      );
    }
    :host ::ng-deep .login-card {
      width: min(100%, 26rem);
      margin: 0 auto;
    }
    .brand h1 {
      margin: 0 0 0.35rem;
      font-size: 1.65rem;
      text-align: center;
    }
    .sub {
      margin: 0 0 1.25rem;
      text-align: center;
      color: var(--p-text-muted-color);
      font-size: 0.95rem;
    }
    .field {
      margin-bottom: 1rem;
    }
    .field label {
      display: block;
      font-size: 0.85rem;
      margin-bottom: 0.35rem;
      color: var(--p-text-muted-color);
    }
    .err {
      color: var(--p-red-500);
      display: block;
      margin-top: 0.25rem;
    }
    .demo-label {
      font-size: 0.75rem;
      color: var(--p-text-muted-color);
    }
    .demo {
      font-size: 0.85rem;
      color: var(--p-text-color);
    }
    .demo p {
      margin: 0.25rem 0;
    }
    .mb-3 {
      margin-bottom: 1rem;
    }
    .mt-2 {
      margin-top: 0.5rem;
    }
    .w-full {
      width: 100%;
    }
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly authError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    this.authError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    setTimeout(() => {
      const ok = this.auth.login(email, password);
      this.loading.set(false);
      if (ok) {
        void this.router.navigate(['/dashboard']);
      } else {
        this.authError.set('Credenciales incorrectas. Usá las credenciales demo.');
      }
    }, 450);
  }
}
