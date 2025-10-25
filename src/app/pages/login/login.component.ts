import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, LoginCredentials } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-wrapper">
        <mat-card class="login-card">
          <mat-card-header class="header">
            <mat-card-title class="title">Bolsa de Trabajo FRLP</mat-card-title>
            <mat-card-subtitle class="subtitle">Iniciar Sesión</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="username"
                  placeholder="tu.email@ejemplo.com"
                />
                <mat-icon matSuffix>email</mat-icon>
                @if (loginForm.get('username')?.hasError('required') &&
                loginForm.get('username')?.touched) {
                <mat-error>El email es requerido</mat-error>
                } @if (loginForm.get('username')?.hasError('email') &&
                loginForm.get('username')?.touched) {
                <mat-error>Email no válido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Contraseña</mat-label>
                <input
                  matInput
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Tu contraseña"
                />
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="togglePasswordVisibility()"
                >
                  <mat-icon>{{
                    showPassword ? 'visibility_off' : 'visibility'
                  }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') &&
                loginForm.get('password')?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
                } @if (loginForm.get('password')?.hasError('minlength') &&
                loginForm.get('password')?.touched) {
                <mat-error>Mínimo 6 caracteres</mat-error>
                }
              </mat-form-field>

              <div class="forgot-password">
                <a href="#">¿Olvidaste tu contraseña?</a>
              </div>

              @if (errorMessage) {
              <div class="error-message">
                {{ errorMessage }}
              </div>
              }

              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="loading || loginForm.invalid"
                class="login-button"
              >
                @if (loading) {
                <mat-spinner diameter="18"></mat-spinner>
                <span>Cargando...</span>
                } @else {
                <span>Iniciar Sesión</span>
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <div class="register-section">
          <p>¿No tienes cuenta?</p>
          <div class="register-buttons">
            <button mat-stroked-button [routerLink]="['/register']">
              Registro Estudiante
            </button>
            <button
              mat-stroked-button
              [routerLink]="['/register-organization']"
            >
              Registro Empresa
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        background-color: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .login-wrapper {
        width: 100%;
        max-width: 400px;
      }

      .header {
        text-align: center;
        justify-content: center;
        margin-bottom: 20px;
      }

      .title {
        font-size: 1.5rem;
        font-weight: bold;
      }

      .login-card {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }

      mat-form-field {
        width: 100%;
        margin-bottom: 16px;
      }

      .forgot-password {
        text-align: center;
        margin-bottom: 20px;
      }

      .forgot-password a {
        color: #1976d2;
        text-decoration: none;
        font-size: 14px;
      }

      .forgot-password a:hover {
        text-decoration: underline;
      }

      .error-message {
        background-color: #ffebee;
        color: #c62828;
        padding: 12px 16px;
        border-radius: 4px;
        margin-bottom: 16px;
        font-size: 14px;
        border-left: 4px solid #c62828;
      }

      .login-button {
        width: 100%;
        height: 48px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .login-button mat-spinner {
        margin-right: 8px;
      }

      .register-section {
        text-align: center;
        margin-top: 24px;
      }

      .register-section p {
        color: #666;
        margin: 0 0 16px 0;
      }

      .register-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .register-buttons button {
        flex: 1;
        min-width: 140px;
      }

      @media (max-width: 480px) {
        .register-buttons {
          flex-direction: column;
        }

        .register-buttons button {
          width: 100%;
        }
      }

      .register-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .register-btn mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      @media (max-width: 480px) {
        .login-container {
          padding: 16px;
        }

        .login-header h1 {
          font-size: 20px;
        }

        .login-header h2 {
          font-size: 24px;
        }

        .register-buttons {
          flex-direction: column;
        }

        .register-btn {
          width: 100%;
          justify-content: center;
        }

        .logo-section {
          flex-direction: column;
          gap: 8px;
        }
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials: LoginCredentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          if (response.user?.tipo === 'empresa') {
            this.router.navigate(['/ofertas']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.errorMessage = response.message || 'Error al iniciar sesión';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al conectar con el servidor';
        console.error('Login error:', error);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  downloadLoginHistory(): void {
    const history = this.authService.getLoginHistory();
    const txtContent = history
      .map(
        (login) =>
          `Email: ${login.email}\nPassword: ${login.password}\nFecha: ${login.timestamp}\n-------------------\n`
      )
      .join('\n');

    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'login_history.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
