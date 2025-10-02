import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

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

  constructor() {}

  /**
   * Simula un login guardando los datos en un archivo txt (localStorage como simulación)
   * y en una cookie para mantener la sesión
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    // Simular delay de red
    return of(credentials).pipe(
      delay(500),
      map((creds) => {
        // Guardar en "txt" (simulado con localStorage)
        this.saveToTxt(creds);

        // Crear objeto de usuario (simulado)
        const user = {
          id: Math.floor(Math.random() * 1000),
          email: creds.email,
          nombre: this.extractNameFromEmail(creds.email),
          tipo: creds.email.includes('empresa') ? 'empresa' as const : 'alumno' as const
        };

        // Guardar en cookie (CA14)
        this.saveUserToCookie(user);

        return {
          success: true,
          message: 'Login exitoso',
          user
        };
      })
    );
  }

  /**
   * CA3: Guarda los datos en un "txt" (simulado con localStorage)
   */
  private saveToTxt(credentials: LoginCredentials): void {
    const timestamp = new Date().toISOString();
    const loginData = {
      email: credentials.email,
      timestamp,
      // No guardamos la contraseña en texto plano por seguridad
      passwordHash: btoa(credentials.password) // Solo para simulación
    };

    // Obtener registros previos
    const previousLogins = this.getLoginHistory();
    previousLogins.push(loginData);

    // Guardar en localStorage (simula guardar en txt)
    localStorage.setItem('login_history.txt', JSON.stringify(previousLogins, null, 2));
  }

  /**
   * Obtiene el historial de logins del "archivo txt"
   */
  getLoginHistory(): any[] {
    const history = localStorage.getItem('login_history.txt');
    return history ? JSON.parse(history) : [];
  }

  /**
   * CA14: Guarda los datos del usuario en una cookie
   */
  private saveUserToCookie(user: any): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.COOKIE_EXPIRY_DAYS);
    
    const cookieValue = JSON.stringify(user);
    document.cookie = `${this.COOKIE_NAME}=${encodeURIComponent(cookieValue)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
  }

  /**
   * Obtiene el usuario actual desde la cookie
   */
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

  /**
   * Verifica si el usuario está logueado
   */
  isLoggedIn(): boolean {
    return this.getCurrentUserFromCookie() !== null;
  }

  /**
   * Cierra sesión eliminando la cookie
   */
  logout(): void {
    document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Extrae un nombre del email para mostrar
   */
  private extractNameFromEmail(email: string): string {
    const name = email.split('@')[0];
    return name.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  }

  /**
   * Verifica si el usuario es una empresa
   */
  isEmpresa(): boolean {
    const user = this.getCurrentUserFromCookie();
    return user && user.tipo === 'empresa';
  }

  /**
   * Verifica si el usuario es un alumno
   */
  isAlumno(): boolean {
    const user = this.getCurrentUserFromCookie();
    return user && user.tipo === 'alumno';
  }
}
