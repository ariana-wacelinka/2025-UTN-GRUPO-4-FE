import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OfertaCardComponent } from '../../components/oferta-card/oferta-card.component';
import { OfertasSearchComponent, OfertaSearchParams } from '../../components/ofertas-search/ofertas-search.component';
import { OfertaListaDTO } from '../../models/oferta.dto';
import { offersService } from '../../services/ofertas.service';

@Component({
  selector: 'app-ofertas-lista',
  standalone: true,
  imports: [MatIconModule, OfertaCardComponent, OfertasSearchComponent],
  template: `
    <div class="ofertas-page">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Todas las Ofertas Laborales</h1>
          <p class="page-subtitle">
            Descubre oportunidades que se adapten a tu perfil
          </p>
        </div>
      </div>

      <div class="ofertas-container">
        <!-- Buscador de ofertas -->
        <app-ofertas-search
          (search)="onSearch($event)"
        ></app-ofertas-search>

        <div class="ofertas-grid">
          @for (oferta of ofertas; track oferta.id) {
          <app-oferta-card [oferta]="oferta"></app-oferta-card>
          }
        </div>

        @if (ofertas.length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">work_off</mat-icon>
          <h3>No hay ofertas disponibles</h3>
          <p>Vuelve pronto para ver nuevas oportunidades</p>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .ofertas-page {
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
        display: flex;
        justify-content: space-between;
        align-items: center;
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

      .results-count {
        text-align: right;
      }

      .count-badge {
        background: var(--glass-white-medium);
        backdrop-filter: blur(10px);
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 500;
        border: 1px solid var(--glass-white-strong);
      }

      .ofertas-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 24px;
      }

      .ofertas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 24px;
      }

      .empty-state {
        text-align: center;
        padding: 80px 20px;
        color: var(--text-muted);
      }

      .empty-icon {
        font-size: 64px !important;
        width: 64px !important;
        height: 64px !important;
        margin-bottom: 24px;
        opacity: 0.5;
      }

      .empty-state h3 {
        font-size: 1.5rem;
        margin-bottom: 12px;
        color: var(--text-light);
      }

      .empty-state p {
        font-size: 1rem;
        max-width: 400px;
        margin: 0 auto;
      }

      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          text-align: center;
          gap: 20px;
          padding: 0 16px;
        }

        .page-title {
          font-size: 2rem;
        }

        .ofertas-container {
          padding: 24px 16px;
        }

        .ofertas-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
      }
    `,
  ],
})
export class OfertasListaComponent implements OnInit {
  ofertas: OfertaListaDTO[] = [];
  currentSearchParams: OfertaSearchParams = {};

  constructor(private ofertasService: offersService) {}

  ngOnInit(): void {
    this.loadOfertas();
  }

  onSearch(params: OfertaSearchParams): void {
    this.currentSearchParams = params;
    this.loadOfertas();
  }

  private loadOfertas(): void {
    this.ofertasService.getoffers(this.currentSearchParams).subscribe((page) => {
      this.ofertas = page.content;
    });
  }
}
