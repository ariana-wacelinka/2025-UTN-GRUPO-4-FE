import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterCredentials } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  credentials: RegisterCredentials = {
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    carrera: ''
  };

  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  carreras = [
    'Ingeniería en Sistemas de Información',
    'Ingeniería Electrónica',
    'Ingeniería Mecánica',
    'Ingeniería Civil',
    'Ingeniería Química',
    'Ingeniería Eléctrica'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = response.message || 'Registro exitoso. Redirigiendo...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Error al registrar usuario';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al conectar con el servidor';
        console.error('Register error:', error);
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

    if (!this.credentials.confirmPassword) {
      this.errorMessage = 'Debes confirmar la contraseña';
      return false;
    }

    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return false;
    }

    if (!this.credentials.nombre || this.credentials.nombre.trim().length < 2) {
      this.errorMessage = 'El nombre debe tener al menos 2 caracteres';
      return false;
    }

    if (!this.credentials.apellido || this.credentials.apellido.trim().length < 2) {
      this.errorMessage = 'El apellido debe tener al menos 2 caracteres';
      return false;
    }

    if (!this.credentials.carrera) {
      this.errorMessage = 'Debes seleccionar una carrera';
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

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
