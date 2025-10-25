import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map, tap, catchError } from 'rxjs/operators';
import { API_URL } from '../app.config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export enum UserRole {
  STUDENT = 'Student',
  ORGANIZATION = 'Organization'
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string;
  location: string;
  description: string | null;
  username: string;
  linkedinUrl?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    nombre: string;
    tipo: 'alumno' | 'empresa';
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly COOKIE_NAME = 'userSession';
  private readonly COOKIE_EXPIRY_DAYS = 7;

  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public loggedIn$ = this.loggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map((response) => {
        // Guardar para cumplir CA3 (solo Sprint 1)
        this.saveToTxt(credentials);

        const user = {
          id: response.id || response.userId,
          email: response.email || credentials.email,
          nombre: response.nombre || response.name || this.extractNameFromEmail(credentials.email),
          tipo: response.tipo || response.role === 'ORGANIZATION' ? 'empresa' as const : 'alumno' as const
        };

        this.saveUserToCookie(user);
        this.loggedInSubject.next(true);

        return {
          success: true,
          message: 'Login exitoso',
          user
        };
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return of({
          success: false,
          message: error.error?.message || 'Error al iniciar sesión'
        });
      })
    );
  }

  register(credentials: RegisterCredentials): Observable<RegisterResponse> {
    const registerData = {
      ...credentials,
      username: credentials.email,
      role: UserRole.STUDENT,
      description: null
    };

    return this.http.post<any>(`${this.apiUrl}/auth/register`, registerData).pipe(
      map((response) => {
        // Guardar en localStorage para cumplir CA3 (solo Sprint 1)
        const existingUsers = this.getRegisteredUsers();
        const newUser = {
          id: response.id || Math.floor(Math.random() * 1000),
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          phone: registerData.phone,
          location: registerData.location,
          description: registerData.description,
          username: registerData.username,
          role: registerData.role,
          passwordHash: btoa(registerData.password),
          fechaRegistro: new Date().toISOString()
        };
        existingUsers.push(newUser);
        localStorage.setItem('registered_users.txt', JSON.stringify(existingUsers, null, 2));

        return {
          success: true,
          message: response.message || 'Registro exitoso. Ya puedes iniciar sesión.'
        };
      }),
      catchError((error) => {
        console.error('Register error:', error);
        return of({
          success: false,
          message: error.error?.message || 'Error en el registro'
        });
      })
    );
  }

  private getRegisteredUsers(): any[] {
    const users = localStorage.getItem('registered_users.txt');
    return users ? JSON.parse(users) : [];
  }

  // TODO Sprint 2: Remover - esto simula guardar en txt con localStorage
  // NOTA: Solo para Sprint 1 - guardamos contraseña en texto plano para cumplir CA3
  private saveToTxt(credentials: LoginCredentials): void {
    const timestamp = new Date().toISOString();
    const loginData = {
      email: credentials.email,
      password: credentials.password,
      timestamp
    };

    const previousLogins = this.getLoginHistory();
    previousLogins.push(loginData);
    localStorage.setItem('login_history.txt', JSON.stringify(previousLogins, null, 2));
  }

  getLoginHistory(): any[] {
    const history = localStorage.getItem('login_history.txt');
    return history ? JSON.parse(history) : [];
  }

  private saveUserToCookie(user: any): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.COOKIE_EXPIRY_DAYS);

    const cookieValue = JSON.stringify(user);
    const cookieString = `${this.COOKIE_NAME}=${encodeURIComponent(cookieValue)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = cookieString;
  }

  getCurrentUserFromCookie(): any | null {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith(`${this.COOKIE_NAME}=`));

    if (sessionCookie) {
      const cookieValue = sessionCookie.split('=')[1];
      try {
        return JSON.parse(decodeURIComponent(cookieValue));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUserFromCookie() !== null;
  }

  logout(): void {
    document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    this.loggedInSubject.next(false);
  }

  private extractNameFromEmail(email: string): string {
    const name = email.split('@')[0];
    return name.split('.').map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  }

  isEmpresa(): boolean {
    const user = this.getCurrentUserFromCookie();
    return user && user.tipo === 'empresa';
  }

  isAlumno(): boolean {
    const user = this.getCurrentUserFromCookie();
    return user && user.tipo === 'alumno';
  }
}
