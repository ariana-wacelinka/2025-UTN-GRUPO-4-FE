import { TestBed } from '@angular/core/testing';
import { AuthService, LoginCredentials, RegisterCredentials } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.message).toBe('Login exitoso');
        expect(response.user).toBeDefined();
        expect(response.user?.email).toBe(credentials.email);
        done();
      });
    });

    it('should save login to txt (localStorage)', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(() => {
        const history = service.getLoginHistory();
        expect(history.length).toBe(1);
        expect(history[0].email).toBe(credentials.email);
        expect(history[0].password).toBe(credentials.password);
        expect(history[0].timestamp).toBeDefined();
        done();
      });
    });

    it('should save user to cookie', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(() => {
        const user = service.getCurrentUserFromCookie();
        expect(user).toBeDefined();
        expect(user.email).toBe(credentials.email);
        done();
      });
    });

    it('should detect empresa type from email', (done) => {
      const credentials: LoginCredentials = {
        email: 'empresa@test.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(() => {
        expect(service.isEmpresa()).toBe(true);
        expect(service.isAlumno()).toBe(false);
        done();
      });
    });

    it('should detect alumno type from email', (done) => {
      const credentials: LoginCredentials = {
        email: 'alumno@test.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(() => {
        expect(service.isAlumno()).toBe(true);
        expect(service.isEmpresa()).toBe(false);
        done();
      });
    });

    it('should update loggedIn$ observable on login', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.loggedIn$.subscribe(isLoggedIn => {
        if (isLoggedIn) {
          expect(isLoggedIn).toBe(true);
          done();
        }
      });

      service.login(credentials).subscribe();
    });
  });

  describe('Register', () => {
    it('should register a new user successfully', (done) => {
      const credentials: RegisterCredentials = {
        email: 'newuser@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        nombre: 'Test',
        apellido: 'User',
        carrera: 'Ingeniería en Sistemas'
      };

      service.register(credentials).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.message).toContain('exitoso');
        done();
      });
    });

    it('should save registered user to localStorage', (done) => {
      const credentials: RegisterCredentials = {
        email: 'newuser@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        nombre: 'Test',
        apellido: 'User',
        carrera: 'Ingeniería en Sistemas'
      };

      service.register(credentials).subscribe(() => {
        const users = JSON.parse(localStorage.getItem('registered_users.txt') || '[]');
        expect(users.length).toBe(1);
        expect(users[0].email).toBe(credentials.email);
        expect(users[0].nombre).toBe(credentials.nombre);
        expect(users[0].apellido).toBe(credentials.apellido);
        expect(users[0].carrera).toBe(credentials.carrera);
        done();
      });
    });

    it('should reject registration with duplicate email', (done) => {
      const credentials: RegisterCredentials = {
        email: 'duplicate@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        nombre: 'Test',
        apellido: 'User',
        carrera: 'Ingeniería en Sistemas'
      };

      service.register(credentials).subscribe(() => {
        service.register(credentials).subscribe(response => {
          expect(response.success).toBe(false);
          expect(response.message).toContain('ya está registrado');
          done();
        });
      });
    });
  });

  describe('Logout', () => {
    it('should clear cookie on logout', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(() => {
        service.logout();
        const user = service.getCurrentUserFromCookie();
        expect(user).toBeNull();
        done();
      });
    });

    it('should update loggedIn$ observable on logout', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      let loginDetected = false;

      service.loggedIn$.subscribe(isLoggedIn => {
        if (isLoggedIn && !loginDetected) {
          loginDetected = true;
          service.logout();
        } else if (!isLoggedIn && loginDetected) {
          expect(isLoggedIn).toBe(false);
          done();
        }
      });

      service.login(credentials).subscribe();
    });
  });

  describe('Session Management', () => {
    it('should return true when user is logged in', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(() => {
        expect(service.isLoggedIn()).toBe(true);
        done();
      });
    });

    it('should return false when user is not logged in', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should retrieve current user from cookie', (done) => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(() => {
        const user = service.getCurrentUserFromCookie();
        expect(user).not.toBeNull();
        expect(user.email).toBe(credentials.email);
        done();
      });
    });
  });

  describe('Login History', () => {
    it('should return empty array when no login history', () => {
      const history = service.getLoginHistory();
      expect(history).toEqual([]);
    });

    it('should accumulate multiple logins in history', (done) => {
      const credentials1: LoginCredentials = {
        email: 'test1@example.com',
        password: 'password123'
      };

      const credentials2: LoginCredentials = {
        email: 'test2@example.com',
        password: 'password456'
      };

      service.login(credentials1).subscribe(() => {
        service.login(credentials2).subscribe(() => {
          const history = service.getLoginHistory();
          expect(history.length).toBe(2);
          expect(history[0].email).toBe(credentials1.email);
          expect(history[1].email).toBe(credentials2.email);
          done();
        });
      });
    });
  });
});
