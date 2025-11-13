import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EmpresaDTO } from '../../models/empresa.dto';
import { EmpresasService } from '../../services/empresas.service';
import { CompanySize } from '../../models/usuario.dto';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="empresas-page">
      <div class="section-header">
        <h2 class="section-title">Todas las empresas</h2>
        <p class="section-subtitle">Explora todas las empresas que publican con nosotros</p>
      </div>
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando empresas...</p>
      </div>
      <div *ngIf="!isLoading" class="empresas-grid">
        @for (empresa of empresas; track empresa.id) {
        <div class="empresa-card">
          <div class="empresa-logo">
            <ng-container *ngIf="empresa.imageUrl; else noLogo">
              <img [src]="empresa.imageUrl" [alt]="empresa.name" class="empresa-img" />
            </ng-container>
            <ng-template #noLogo>
              <div class="empresa-placeholder">
                <mat-icon>business</mat-icon>
              </div>
            </ng-template>
          </div>
          <div class="empresa-info">
            <h3 class="empresa-nombre">{{ empresa.name }}</h3>
            <p class="empresa-sector">{{ empresa.industry }}</p>
            <span class="empresa-tamanio" *ngIf="empresa.size">{{ getSizeLabel(empresa.size) }}</span>
          </div>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
    .empresas-page { max-width: 1200px; margin: 24px auto; padding: 0 24px; }
    .section-header { text-align: center; margin-bottom: 24px; }
    .empresas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 60px; }

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

    .empresa-placeholder {
      width: 72px;
      height: 72px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      color: var(--white);
      border-radius: 50%;
      font-size: 36px;
      border: 1px solid rgba(255,255,255,0.08);
      margin: 0 auto 8px;
    }

    .empresa-nombre {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: 1rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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

    @media (max-width: 768px) {
      .empresas-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
      }

      .empresa-card {
        padding: 24px 16px;
      }
    }
    `
  ]
})
export class EmpresasComponent implements OnInit {
  empresas: EmpresaDTO[] = [];
  isLoading = true;

  constructor(private empresasService: EmpresasService) {}

  ngOnInit(): void {
    // Revert to using the general companies endpoint to avoid depending on the
    // user-specific recommended offers endpoint.
    this.isLoading = true;
    this.empresasService.getEmpresas().subscribe({
      next: (empresas: EmpresaDTO[]) => {
        this.empresas = empresas || [];
        this.isLoading = false;
      },
      error: () => {
        this.empresas = [];
        this.isLoading = false;
      }
    });
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
