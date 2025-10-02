import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

export interface LoginCredentials {
  email: string;
  password: string;
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

  // TODO Sprint 2: Remover - esto simula guardar en txt con localStorage
  private saveToTxt(credentials: LoginCredentials): void {
    const timestamp = new Date().toISOString();
    const loginData = {
      email: credentials.email,
      timestamp,
      passwordHash: btoa(credentials.password)
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
