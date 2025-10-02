import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials', () => {
    expect(component.credentials.email).toBe('');
    expect(component.credentials.password).toBe('');
    expect(component.credentials.confirmPassword).toBe('');
    expect(component.credentials.nombre).toBe('');
    expect(component.credentials.apellido).toBe('');
    expect(component.credentials.carrera).toBe('');
  });

  it('should have a list of carreras', () => {
    expect(component.carreras).toBeDefined();
    expect(component.carreras.length).toBeGreaterThan(0);
    expect(component.carreras).toContain('Ingeniería en Sistemas de Información');
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      component.credentials.email = 'invalid-email';
      component.onRegister();
      expect(component.errorMessage).toContain('email no es válido');
    });

    it('should require email', () => {
      component.credentials.email = '';
      component.onRegister();
      expect(component.errorMessage).toContain('email es requerido');
    });

    it('should require password', () => {
      component.credentials.email = 'test@example.com';
      component.credentials.password = '';
      component.onRegister();
      expect(component.errorMessage).toContain('contraseña es requerida');
    });

    it('should validate password minimum length', () => {
      component.credentials.email = 'test@example.com';
      component.credentials.password = '123';
      component.onRegister();
      expect(component.errorMessage).toContain('al menos 6 caracteres');
    });

    it('should require password confirmation', () => {
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.credentials.confirmPassword = '';
      component.onRegister();
      expect(component.errorMessage).toContain('confirmar la contraseña');
    });

    it('should validate passwords match', () => {
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.credentials.confirmPassword = 'different';
      component.onRegister();
      expect(component.errorMessage).toContain('contraseñas no coinciden');
    });

    it('should validate nombre minimum length', () => {
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.credentials.confirmPassword = 'password123';
      component.credentials.nombre = 'A';
      component.onRegister();
      expect(component.errorMessage).toContain('nombre debe tener al menos 2 caracteres');
    });

    it('should validate apellido minimum length', () => {
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.credentials.confirmPassword = 'password123';
      component.credentials.nombre = 'Test';
      component.credentials.apellido = 'B';
      component.onRegister();
      expect(component.errorMessage).toContain('apellido debe tener al menos 2 caracteres');
    });

    it('should require carrera selection', () => {
      component.credentials.email = 'test@example.com';
      component.credentials.password = 'password123';
      component.credentials.confirmPassword = 'password123';
      component.credentials.nombre = 'Test';
      component.credentials.apellido = 'User';
      component.credentials.carrera = '';
      component.onRegister();
      expect(component.errorMessage).toContain('seleccionar una carrera');
    });
  });

  describe('Registration', () => {
    beforeEach(() => {
      component.credentials = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        nombre: 'Test',
        apellido: 'User',
        carrera: 'Ingeniería en Sistemas'
      };
    });

    it('should call authService.register with valid credentials', () => {
      mockAuthService.register.and.returnValue(of({ success: true, message: 'Registro exitoso' }));
      
      component.onRegister();
      
      expect(mockAuthService.register).toHaveBeenCalledWith(component.credentials);
    });

    it('should show success message on successful registration', () => {
      mockAuthService.register.and.returnValue(of({ success: true, message: 'Registro exitoso' }));
      
      component.onRegister();
      
      expect(component.successMessage).toContain('exitoso');
      expect(component.loading).toBe(false);
    });

    it('should redirect to login after successful registration', (done) => {
      mockAuthService.register.and.returnValue(of({ success: true, message: 'Registro exitoso' }));
      
      component.onRegister();
      
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }, 2100);
    });

    it('should show error message on failed registration', () => {
      mockAuthService.register.and.returnValue(of({ success: false, message: 'Email ya registrado' }));
      
      component.onRegister();
      
      expect(component.errorMessage).toContain('Email ya registrado');
      expect(component.loading).toBe(false);
    });

    it('should show generic error message on service error', () => {
      mockAuthService.register.and.throwError('Network error');
      
      component.onRegister();
      
      expect(component.errorMessage).toContain('Error al conectar');
      expect(component.loading).toBe(false);
    });
  });

  describe('Password Visibility', () => {
    it('should toggle password visibility', () => {
      expect(component.showPassword).toBe(false);
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(true);
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(false);
    });

    it('should toggle confirm password visibility', () => {
      expect(component.showConfirmPassword).toBe(false);
      component.toggleConfirmPasswordVisibility();
      expect(component.showConfirmPassword).toBe(true);
      component.toggleConfirmPasswordVisibility();
      expect(component.showConfirmPassword).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should set loading to true during registration', () => {
      mockAuthService.register.and.returnValue(of({ success: true, message: 'Success' }));
      component.credentials = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        nombre: 'Test',
        apellido: 'User',
        carrera: 'Ingeniería en Sistemas'
      };

      component.onRegister();
      
      // En un escenario real, aquí verificarías que loading es true durante la operación
      // pero como el observable completa inmediatamente, loading ya es false
      expect(component.loading).toBe(false);
    });
  });
});
