import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // CA1 y CA2: Campos de email y contraseña
  credentials: LoginCredentials = {
    email: '',
    password: ''
  };

  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * CA3: Maneja el login guardando los datos en txt
   * CA14: Guarda el resultado en una cookie
   */
  onLogin(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          // Redirigir según el tipo de usuario
          if (response.user?.tipo === 'empresa') {
            this.router.navigate(['/ofertas']); // Empresas ven ofertas
          } else {
            this.router.navigate(['/']); // Alumnos van al home
          }
        } else {
          this.errorMessage = response.message || 'Error al iniciar sesión';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al conectar con el servidor';
        console.error('Login error:', error);
      }
    });
  }

  private validateForm(): boolean {
    if (!this.credentials.email) {
      this.errorMessage = 'El email es requerido';
      return false;
    }

    if (!this.isValidEmail(this.credentials.email)) {
      this.errorMessage = 'El email no es válido';
      return false;
    }

    if (!this.credentials.password) {
      this.errorMessage = 'La contraseña es requerida';
      return false;
    }

    if (this.credentials.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
