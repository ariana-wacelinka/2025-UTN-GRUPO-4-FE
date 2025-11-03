import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { OfertasSearchComponent, OfertaSearchParams } from '../../components/ofertas-search/ofertas-search.component';
import { UsuariosSearchComponent } from '../../components/usuarios-search/usuarios-search.component';
import { OfertaCardComponent } from '../../components/oferta-card/oferta-card.component';
import { OfertaListaDTO } from '../../models/oferta.dto';
import { offersService } from '../../services/ofertas.service';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    OfertasSearchComponent,
    UsuariosSearchComponent,
    OfertaCardComponent,
  ],
  template: `
    <div class="busqueda-page">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Búsqueda</h1>
          <p class="page-subtitle">
            Encuentra usuarios y ofertas laborales
          </p>
        </div>
      </div>

      <div class="busqueda-container">
        <mat-tab-group animationDuration="300ms" class="search-tabs">
          <!-- Tab de Ofertas -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">work</mat-icon>
              Ofertas Laborales
            </ng-template>

            <div class="tab-content">
              <app-ofertas-search
                (search)="onSearchOfertas($event)"
              ></app-ofertas-search>

              <div class="results-section">
                @if (isLoadingOfertas) {
                  <div class="loading-state">
                    <mat-icon class="loading-icon">hourglass_empty</mat-icon>
                    <p>Buscando ofertas...</p>
                  </div>
                }

                @if (!isLoadingOfertas && ofertas.length > 0) {
                  <div class="ofertas-grid">
                    @for (oferta of ofertas; track oferta.id) {
                      <app-oferta-card [oferta]="oferta"></app-oferta-card>
                    }
                  </div>
                }

                @if (!isLoadingOfertas && searchPerformedOfertas && ofertas.length === 0) {
                  <div class="empty-state">
                    <mat-icon class="empty-icon">work_off</mat-icon>
                    <h3>No se encontraron ofertas</h3>
                    <p>Intenta modificar los criterios de búsqueda</p>
                  </div>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Tab de Usuarios -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">people</mat-icon>
              Usuarios
            </ng-template>

            <div class="tab-content">
              <app-usuarios-search></app-usuarios-search>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [
    `
      .busqueda-page {
        min-height: 100vh;
        background: var(--background-page);
      }

      .page-header {
        background: var(--primary-gradient);
        color: var(--white);
        padding: 60px 0 40px;
        position: relative;
        overflow: hidden;
      }

      .page-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--primary-gradient);
        background-size: cover;
      }

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
        position: relative;
        z-index: 1;
      }

      .page-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 8px 0;
      }

      .page-subtitle {
        font-size: 1.1rem;
        opacity: 0.9;
        margin: 0;
      }

      .busqueda-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 24px;
      }

      .search-tabs {
        background: var(--white);
        border-radius: 12px;
        box-shadow: 0 2px 8px var(--shadow-light);
        overflow: hidden;
      }

      ::ng-deep .search-tabs .mat-mdc-tab-labels {
        background: var(--background-light);
        border-bottom: 2px solid var(--shadow-black);
      }

      ::ng-deep .search-tabs .mat-mdc-tab-label {
        min-width: 160px;
        height: 64px;
        padding: 0 32px;
      }

      ::ng-deep .search-tabs .mat-mdc-tab-label-content {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        font-size: 1rem;
      }

      .tab-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      ::ng-deep .search-tabs .mat-mdc-tab-label-active {
        background: var(--white);
      }

      ::ng-deep .search-tabs .mdc-tab-indicator__content--underline {
        border-color: var(--primary-color);
        border-width: 3px;
      }

      .tab-content {
        padding: 24px;
      }

      .results-section {
        margin-top: 24px;
      }

      .ofertas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 24px;
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-muted);
      }

      .loading-icon,
      .empty-icon {
        font-size: 64px !important;
        width: 64px !important;
        height: 64px !important;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .loading-icon {
        animation: spin 2s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .empty-state h3 {
        font-size: 1.5rem;
        margin-bottom: 12px;
        color: var(--text-light);
      }

      .empty-state p {
        font-size: 1rem;
      }

      @media (max-width: 768px) {
        .header-content {
          padding: 0 16px;
        }

        .page-title {
          font-size: 2rem;
        }

        .busqueda-container {
          padding: 24px 16px;
        }

        .tab-content {
          padding: 16px;
        }

        .ofertas-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        ::ng-deep .search-tabs .mat-mdc-tab-label {
          min-width: 120px;
          padding: 0 16px;
        }
      }
    `,
  ],
})
export class BusquedaComponent {
  ofertas: OfertaListaDTO[] = [];
  isLoadingOfertas = false;
  searchPerformedOfertas = false;

  constructor(private ofertasService: offersService) {}

  onSearchOfertas(params: OfertaSearchParams): void {
    this.isLoadingOfertas = true;
    this.searchPerformedOfertas = true;

    this.ofertasService.getoffers(params).subscribe({
      next: (page) => {
        this.ofertas = page.content;
        this.isLoadingOfertas = false;
      },
      error: (error) => {
        console.error('Error al buscar ofertas:', error);
        this.ofertas = [];
        this.isLoadingOfertas = false;
      },
    });
  }
}
