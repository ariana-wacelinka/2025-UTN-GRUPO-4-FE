import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EmpresaDTO } from '../../models/empresa.dto';
import { CompanySize } from '../../models/usuario.dto';
import { EmpresasService } from '../../services/empresas.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="homepage-container">
      <section class="hero-section animate-fade-in">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Encuentra tu
              <span class="gradient-text">próxima oportunidad</span> laboral
            </h1>
            <p class="hero-subtitle">
              Conectamos estudiantes universitarios con las mejores ofertas de
              trabajo en tecnología
            </p>
            <div class="hero-actions">
              <button
                mat-raised-button
                class="cta-button"
                color="primary"
                (click)="verTodasOfertas()"
              >
                <mat-icon>rocket_launch</mat-icon>
                Explorar Ofertas
              </button>
              <button mat-stroked-button class="secondary-button">
                <mat-icon>info</mat-icon>
                Cómo funciona
              </button>
            </div>
          </div>
          <div class="hero-visual">
            <div class="floating-card card-1">💼</div>
            <div class="floating-card card-2">🚀</div>
            <div class="floating-card card-3">🎆</div>
          </div>
        </div>
      </section>

      <section class="empresas-confianza">
        <div class="section-header">
          <h2 class="section-title">Empresas que confían en nosotros</h2>
          <p class="section-subtitle">
            Las mejores empresas tecnológicas publican sus ofertas con nosotros
          </p>
        </div>
        <div class="empresas-grid">
          @for (empresa of empresas; track empresa.id) {
          <div class="empresa-card">
            <div class="empresa-logo">
              <img [src]="empresa.imageUrl" [alt]="empresa.name" class="empresa-img" />
            </div>
            <div class="empresa-info">
              <h3 class="empresa-nombre">{{ empresa.name }}</h3>
              <p class="empresa-sector">{{ empresa.industry }}</p>
              <span class="empresa-tamanio">{{ getSizeLabel(empresa.size) }}</span>
            </div>
          </div>
          }
        </div>
        <div class="ver-mas">
          <button
            mat-raised-button
            class="view-all-button"
            (click)="verTodasOfertas()"
          >
            Ver todas las ofertas
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
    .homepage-container {
      min-height: 100vh;
    }

    .hero-section {
      background: var(--primary-gradient);
      padding: 80px 0;
      margin-bottom: 80px;
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--primary-gradient);
      background-size: cover;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .hero-text {
      color: var(--white);
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 24px;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      line-height: 1.6;
      margin-bottom: 40px;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .cta-button {
      background: var(--white) !important;
      color: var(--primary-color) !important;
      border-radius: 50px !important;
      padding: 16px 32px !important;
      font-weight: 600 !important;
      font-size: 16px !important;
      text-transform: none !important;
      box-shadow: 0 8px 24px var(--shadow-black-medium) !important;
      transition: all 0.3s ease !important;
    }

    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px var(--shadow-black-strong) !important;
    }

    .secondary-button {
      border: 2px solid var(--glass-white-strong) !important;
      color: var(--white) !important;
      border-radius: 50px !important;
      padding: 14px 28px !important;
      font-weight: 500 !important;
      text-transform: none !important;
      backdrop-filter: blur(10px);
    }

    .hero-visual {
      position: relative;
      height: 400px;
    }

    .floating-card {
      position: absolute;
      width: 80px;
      height: 80px;
      background: var(--glass-white-light);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      animation: float 6s ease-in-out infinite;
      border: 1px solid var(--glass-border);
    }

    .card-1 {
      top: 20%;
      left: 20%;
      animation-delay: 0s;
    }

    .card-2 {
      top: 50%;
      right: 20%;
      animation-delay: 2s;
    }

    .card-3 {
      bottom: 20%;
      left: 40%;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    .stats-section {
      padding: 60px 0;
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(10px);
      margin-bottom: 80px;
    }

    .stats-grid {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 40px;
      text-align: center;
    }

    .stat-item {
      padding: 20px;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 800;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 1.1rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .empresas-confianza {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px 80px;
    }

    .section-header {
      text-align: center;
      margin-bottom: 60px;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 16px;
    }

    .section-subtitle {
      font-size: 1.2rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
    }

    .empresas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 60px;
    }

    .empresa-card {
      background: var(--white);
      border-radius: var(--border-radius);
      padding: 32px 24px;
      text-align: center;
      box-shadow: var(--shadow-light);
      transition: var(--transition);
      border: 1px solid var(--border-light);
    }

    .empresa-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-medium);
    }

    .empresa-logo {
      margin-bottom: 16px;
      display: block;
      height: 60px;
      width: 60px;
      margin: 0 auto 16px;
    }

    .empresa-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .empresa-nombre {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }

    .empresa-sector {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin: 0 0 12px 0;
    }

    .empresa-tamanio {
      display: inline-block;
      background: var(--chip-bg);
      color: var(--primary-color);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid var(--chip-border);
    }

    .ver-mas {
      text-align: center;
    }

    .view-all-button {
      background: var(--primary-gradient) !important;
      color: var(--white) !important;
      border-radius: 50px !important;
      padding: 16px 32px !important;
      font-weight: 600 !important;
      text-transform: none !important;
      box-shadow: 0 8px 24px var(--shadow-primary) !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .view-all-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px var(--shadow-primary-hover) !important;
    }

    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: 40px;
        text-align: center;
        padding: 0 16px;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }

      .hero-visual {
        height: 200px;
      }

      .floating-card {
        width: 60px;
        height: 60px;
        font-size: 24px;
      }

      .stats-grid {
        padding: 0 16px;
        gap: 20px;
      }

      .stat-number {
        font-size: 2rem;
      }

      .section-title {
        font-size: 2rem;
      }

      .empresas-confianza {
        padding: 0 16px 60px;
      }

      .empresas-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      }

      .empresa-card {
        padding: 24px 16px;
      }
    }
  `,
  ],
})
export class HomepageComponent implements OnInit {
  empresas: EmpresaDTO[] = [];

  constructor(private empresasService: EmpresasService, private router: Router) { }

  ngOnInit(): void {
    this.empresasService.getEmpresas().subscribe((empresas) => {
      this.empresas = empresas;
    });
  }

  verTodasOfertas(): void {
    this.router.navigate(['/busqueda']);
  }

  getSizeLabel(size: CompanySize): string {
    const sizeLabels = {
      [CompanySize.FROM_1_TO_10]: '1-10 empleados',
      [CompanySize.FROM_11_TO_50]: '11-50 empleados',
      [CompanySize.FROM_51_TO_200]: '51-200 empleados',
      [CompanySize.FROM_201_TO_500]: '201-500 empleados',
      [CompanySize.MORE_THAN_500]: '500+ empleados'
    };
    return sizeLabels[size] || 'Tamaño no especificado';
  }
}
