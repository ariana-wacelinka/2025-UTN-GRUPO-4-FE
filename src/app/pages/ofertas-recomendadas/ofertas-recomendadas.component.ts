import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfertaListaDTO } from '../../models/oferta.dto';
import { offersService } from '../../services/ofertas.service';
import { OfertaCardComponent } from '../../components/oferta-card/oferta-card.component';

@Component({
  selector: 'app-ofertas-recomendadas',
  standalone: true,
  imports: [CommonModule, OfertaCardComponent],
  template: `
    <div class="ofertas-page">
      <div class="section-header">
        <h2 class="section-title">Ofertas recomendadas</h2>
        <p class="section-subtitle">Ofertas seleccionadas para ti</p>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando ofertas recomendadas...</p>
      </div>

      <div *ngIf="!isLoading" class="ofertas-list">
        <app-oferta-card *ngFor="let oferta of ofertas; trackBy: trackById" [oferta]="oferta"></app-oferta-card>
      </div>
    </div>
  `,
  styles: [
    `
    .ofertas-page { max-width: 1100px; margin: 24px auto; padding: 0 16px; }
    .section-header { text-align: center; margin-bottom: 16px; }
    .ofertas-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 16px; }

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
    `
  ]
})
export class OfertasRecomendadasComponent implements OnInit {
  ofertas: OfertaListaDTO[] = [];
  isLoading = true;

  constructor(private ofertasService: offersService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.ofertasService.getRecommendedOffers().subscribe({
      next: (data: any) => {
        // El backend puede devolver directamente un array o un objeto paginado { content: [...] }
        if (Array.isArray(data)) {
          this.ofertas = data;
        } else if (data && Array.isArray(data.content)) {
          this.ofertas = data.content;
        } else {
          this.ofertas = [];
        }
        this.isLoading = false;
      },
      error: () => { this.ofertas = []; this.isLoading = false; }
    });
  }

  trackById(index: number, item: OfertaListaDTO) { return item.id; }
}
