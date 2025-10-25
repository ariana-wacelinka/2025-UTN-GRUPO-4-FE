import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <nav class="modern-navbar">
      <div class="navbar-content">
        <div class="logo-section" (click)="irInicio()">
          <mat-icon class="school-icon">school</mat-icon>
          <span class="logo-text">UniJobs</span>
        </div>
        <div class="nav-links">
          <button class="nav-button" (click)="irInicio()">
            <span>Inicio</span>
          </button>
          <button class="nav-button" (click)="verOfertas()">
            <span>Ofertas</span>
          </button>
          <button class="nav-button" (click)="publicarOferta()">
            <span>Publicar Oferta</span>
          </button>

          <ng-container *ngIf="!isLoggedIn">
            <button class="login-button" (click)="irLogin()">
              <span>Iniciar Sesión</span>
            </button>
          </ng-container>

          <ng-container *ngIf="isLoggedIn">
            <button class="profile-button" (click)="irPerfil()">
              <span>Mi Perfil</span>
            </button>
            <button class="logout-button" (click)="cerrarSesion()">
              <span><mat-icon>logout</mat-icon></span>
            </button>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .modern-navbar {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
        padding: 12px 0;
      }

      .navbar-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      .logo-section {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      }

      .logo-section:hover {
        transform: scale(1.05);
      }

      .logo-icon {
        font-size: 32px;
        filter: drop-shadow(0 4px 8px var(--shadow-dark));
      }

      .school-icon {
        position: absolute;
        right: -13px;
        top: -6px;
        font-size: 20px !important;
        color: var(--primary-dark);
        z-index: 1;
        transform: rotate(25grad);
      }

      .logo-text {
        font-size: 24px;
        font-weight: 700;
        background: var(--primary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .nav-button {
        background: none;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        padding: 10px 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #4a5568;
        font-size: 16px;
      }

      .nav-button:hover {
        background: #f7fafc;
        color: #2d3748;
        transform: translateY(-2px);
      }

      .login-button {
        background: white;
        border: 2px solid #667eea;
        border-radius: 8px;
        font-weight: 600;
        padding: 10px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #667eea;
        font-size: 16px;
      }

      .login-button:hover {
        background: #667eea;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      .profile-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 20px;
        font-weight: 600;
        padding: 10px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      .profile-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }

      .logout-button {
        border: none;
        background-color: white;
        border-radius: 8px;
        padding: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: black;

        mat-icon {
          margin-top: 10px;
          font-size: 18px;
        }
      }

      @media (max-width: 768px) {
        .navbar-content {
          padding: 0 16px;
        }

        .logo-text {
          font-size: 18px;
        }

        .school-icon {
          font-size: 24px;
        }

        .nav-links {
          gap: 4px;
        }

        .nav-button,
        .login-button,
        .profile-button,
        .logout-button {
          padding: 8px 12px;
          font-size: 14px;
        }
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios de estado de autenticación
    this.authService.loggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  irInicio(): void {
    this.router.navigate(['/']);
  }

  verOfertas(): void {
    this.router.navigate(['/ofertas']);
  }

  irPerfil(): void {
    // Navegar según el tipo de usuario
    if (this.authService.isEmpresa()) {
      this.router.navigate(['/perfil-empresa']);
    } else {
      this.router.navigate(['/perfil']);
    }
  }

  irLogin(): void {
    this.router.navigate(['/login']);
  }

  publicarOferta(): void {
    this.router.navigate(['/publicar-oferta']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    // Ya no necesitamos actualizar isLoggedIn aquí porque el observable lo hace automáticamente
    this.router.navigate(['/']);
  }
}
