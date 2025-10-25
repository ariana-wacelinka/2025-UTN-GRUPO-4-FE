import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OfertaListaDTO } from '../../models/oferta.dto';

@Component({
  selector: 'app-oferta-card',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
  template: `
    <mat-card class="oferta-card modern-card" (click)="verDetalle()">
      <div class="card-header">
        <div class="title-section">
          <h3 class="job-title">{{ oferta.title }}</h3>
          <div class="location">
            <mat-icon class="location-icon">location_on</mat-icon>
            <span>{{ oferta.location }}</span>
          </div>
        </div>
        <div class="salary-badge">
          {{ oferta.estimatedPayment }}
        </div>
      </div>

      <mat-card-content class="card-content">
        <div class="job-details">
          <div class="detail-item">
            <mat-icon class="detail-icon">work</mat-icon>
            <span>{{ oferta.modality }}</span>
          </div>
        </div>

        <div class="tech-stack">
          @for (atributo of atributosLimitados; track atributo) {
            <mat-chip class="tech-chip" selected>{{ atributo }}</mat-chip>
          }
          @if ((oferta.attributes?.length || 0) > 5) {
            <span class="more-tech">+{{ (oferta.attributes?.length || 0) - 5 }} más</span>
          }
        </div>
      </mat-card-content>

      <div class="card-footer">
        <button mat-button class="view-details-btn">
          Ver detalles
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </div>
    </mat-card>
  `,
  styles: [`
    .oferta-card {
      cursor: pointer;
      margin: 16px 0;
      background: linear-gradient(135deg, var(--white) 0%, var(--background-light) 100%);
      border: 1px solid var(--shadow-black);
      position: relative;
      overflow: hidden;
    }

    .oferta-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-gradient);
    }

    .card-header {
      padding: 24px 24px 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .title-section {
      flex: 1;
    }

    .job-title {
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px 0;
      line-height: 1.3;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .location-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .salary-badge {
      background: var(--secondary-gradient);
      color: var(--white);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 4px 12px var(--shadow-primary);
    }

    .card-content {
      padding: 0 24px 16px !important;
    }

    .job-details {
      margin-bottom: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .detail-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--primary-color);
    }

    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }

    .tech-chip {
      background: var(--chip-bg) !important;
      color: var(--primary-color) !important;
      border: 1px solid var(--chip-border) !important;
      font-size: 0.75rem !important;
      font-weight: 500 !important;
      height: 28px !important;
      border-radius: 14px !important;
    }

    .more-tech {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
      padding: 4px 8px;
      background: var(--muted-bg);
      border-radius: 12px;
    }

    .card-footer {
      padding: 16px 24px 24px;
      border-top: 1px solid var(--shadow-black);
      background: rgba(248, 250, 252, 0.5);
    }

    .view-details-btn {
      color: var(--primary-color) !important;
      font-weight: 500 !important;
      text-transform: none !important;
      padding: 8px 16px !important;
      border-radius: 8px !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      transition: all 0.3s ease !important;
    }

    .view-details-btn:hover {
      background: var(--chip-bg) !important;
    }

    .view-details-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      transition: transform 0.3s ease;
    }

    .oferta-card:hover .view-details-btn mat-icon {
      transform: translateX(4px);
    }

    @media (max-width: 768px) {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 20px 20px 12px;
      }

      .salary-badge {
        align-self: flex-start;
      }

      .job-title {
        font-size: 1.2rem;
      }

      .card-content {
        padding: 0 20px 12px !important;
      }

      .card-footer {
        padding: 12px 20px 20px;
      }
    }
  `]
})
export class OfertaCardComponent {
  @Input() oferta!: OfertaListaDTO;

  constructor(private router: Router) {}

  get atributosLimitados(): string[] {
    return this.oferta.attributes?.slice(0, 5) || [];
  }

  verDetalle(): void {
    this.router.navigate(['/oferta', this.oferta.id]);
  }
}
