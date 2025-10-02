import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellido: string;
  carrera: string;
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

  constructor() {}

  // TODO Sprint 2: Reemplazar con llamada HTTP al backend /api/auth/login
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return of(credentials).pipe(
      delay(500),
      map((creds) => {
        this.saveToTxt(creds);

        const user = {
          id: Math.floor(Math.random() * 1000),
          email: creds.email,
          nombre: this.extractNameFromEmail(creds.email),
          tipo: creds.email.includes('empresa') ? 'empresa' as const : 'alumno' as const
        };

        this.saveUserToCookie(user);
        this.loggedInSubject.next(true);

        return {
          success: true,
          message: 'Login exitoso',
          user
        };
      })
    );
  }

  // TODO Sprint 2: Reemplazar con llamada HTTP al backend /api/auth/register
  register(credentials: RegisterCredentials): Observable<RegisterResponse> {
    return of(credentials).pipe(
      delay(500),
      map((creds) => {
        // Verificar si el email ya existe
        const existingUsers = this.getRegisteredUsers();
        if (existingUsers.find(u => u.email === creds.email)) {
          return {
            success: false,
            message: 'El email ya está registrado'
          };
        }

        // Guardar nuevo usuario en localStorage
        const newUser = {
          id: Math.floor(Math.random() * 1000),
          email: creds.email,
          nombre: creds.nombre,
          apellido: creds.apellido,
          carrera: creds.carrera,
          passwordHash: btoa(creds.password),
          tipo: 'alumno' as const,
          fechaRegistro: new Date().toISOString()
        };

        existingUsers.push(newUser);
        localStorage.setItem('registered_users.txt', JSON.stringify(existingUsers, null, 2));

        return {
          success: true,
          message: 'Registro exitoso. Ya puedes iniciar sesión.'
        };
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
