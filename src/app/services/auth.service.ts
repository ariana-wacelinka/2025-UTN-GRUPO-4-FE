import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map, tap, catchError } from 'rxjs/operators';
import { API_URL } from '../app.config';

export interface LoginCredentials {
  username: string;
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
  lastName: string|null;
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

  public idKeycloakUser: string | null = null;

  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {}

  extractSubFromIdToken(idToken: string): void {
    const decoded = this.decodeJWT(idToken);
    if (decoded && decoded.sub) {
      this.idKeycloakUser = decoded.sub;
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    console.log('=== LOGIN CREDENTIALS ENVIADAS ===');
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map((response) => {
        console.log('=== LOGIN RESPONSE COMPLETO ===');
        console.log(JSON.stringify(response, null, 2));

        if (response.id_token) {
          this.extractSubFromIdToken(response.id_token);
          this.saveIdTokenToCookie(response.id_token);
          this.loggedInSubject.next(true);
        }

        return {
          success: true,
          message: 'Login exitoso'
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
    const registerData = credentials

    return this.http.post<any>(`${this.apiUrl}/auth/register`, registerData).pipe(
      map((response) => {
        return {
          success: true,
          message: 'Registro exitoso.'
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
      email: credentials.username,
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

  private saveIdTokenToCookie(idToken: string): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.COOKIE_EXPIRY_DAYS);

    const cookieString = `${this.COOKIE_NAME}=${encodeURIComponent(idToken)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = cookieString;
  }

  getIdTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith(`${this.COOKIE_NAME}=`));

    if (sessionCookie) {
      const cookieValue = sessionCookie.split('=')[1];
      try {
        return decodeURIComponent(cookieValue);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getIdTokenFromCookie() !== null;
  }

  logout(): void {
    document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    this.idKeycloakUser = null;
    this.loggedInSubject.next(false);
  }

  private extractNameFromEmail(email: string): string {
    const name = email.split('@')[0];
    return name.split('.').map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  }

  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  isEmpresa(): boolean {
    return false;
  }

  isAlumno(): boolean {
    return true;
  }
}
