import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, RegisterCredentials, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-register-organization',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './register-organization.component.html',
  styleUrls: ['./register-organization.component.scss']
})
export class RegisterOrganizationComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      location: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      linkedinUrl: ['', [Validators.required, Validators.pattern(/^https:\/\/[a-z]{2,3}\.linkedin\.com\/.*$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registerForm.value;
    const credentials: RegisterCredentials = {
      username: formValue.email,
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: '',
      role: UserRole.ORGANIZATION,
      phone: formValue.phone,
      location: formValue.location,
      description: formValue.description,
      linkedinUrl: formValue.linkedinUrl
    };

    this.authService.register(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = response.message || 'Registro exitoso. Redirigiendo...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Error al registrar organización';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al conectar con el servidor';
        console.error('Register error:', error);
      }
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors!['passwordMismatch'];
      if (Object.keys(confirmPassword.errors!).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (field?.hasError('email')) {
      return 'Email no válido';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (field?.hasError('pattern')) {
      return 'URL de LinkedIn no válida';
    }
    if (field?.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'Nombre de la organización',
      email: 'Email',
      phone: 'Teléfono',
      location: 'Ubicación',
      description: 'Descripción',
      linkedinUrl: 'LinkedIn URL',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}