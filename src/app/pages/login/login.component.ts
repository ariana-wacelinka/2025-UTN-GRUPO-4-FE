import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginCredentials } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
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

  downloadLoginHistory(): void {
    const history = this.authService.getLoginHistory();
    const txtContent = history.map(login => 
      `Email: ${login.email}\nPassword: ${login.password}\nFecha: ${login.timestamp}\n-------------------\n`
    ).join('\n');

    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'login_history.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
