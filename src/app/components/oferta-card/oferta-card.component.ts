import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { OfertaListaDTO, VoteResponseDTO } from '../../models/oferta.dto';
import { offersService } from '../../services/ofertas.service';
import { AuthService } from '../../services/auth.service';
import { KeycloakUser } from '../../models/keycloak-user.model';

@Component({
  selector: 'app-oferta-card',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, CommonModule],
  template: `
    <mat-card class="oferta-card modern-card">
      <div class="card-header" (click)="verDetalle()">
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

      <mat-card-content class="card-content" (click)="verDetalle()">
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
        <div class="footer-actions">
          @if (canVote()) {
            <div class="vote-buttons">
              <button 
                mat-icon-button 
                class="vote-button like-button"
                [class.active]="oferta.userVote === true"
                (click)="onLike($event)"
                [disabled]="isVoting">
                <mat-icon>thumb_up</mat-icon>
                @if (oferta.positiveVotes !== undefined) {
                  <span class="vote-count">{{ oferta.positiveVotes }}</span>
                }
              </button>
              
              <button 
                mat-icon-button 
                class="vote-button dislike-button"
                [class.active]="oferta.userVote === false"
                (click)="onDislike($event)"
                [disabled]="isVoting">
                <mat-icon>thumb_down</mat-icon>
                @if (oferta.negativeVotes !== undefined) {
                  <span class="vote-count">{{ oferta.negativeVotes }}</span>
                }
              </button>
            </div>
          }
          
          <button mat-button class="view-details-btn" (click)="verDetalle($event)">
            Ver detalles
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .oferta-card {
      margin: 16px 0;
      background: linear-gradient(135deg, var(--white) 0%, var(--background-light) 100%);
      border: 1px solid var(--shadow-black);
      position: relative;
      overflow: visible;
    }

    .card-header,
    .card-content {
      cursor: pointer;
      position: relative;
      z-index: 2;
    }

    .oferta-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-gradient);
      z-index: 1;
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
      padding: 20px 24px 24px;
      border-top: 1px solid var(--shadow-black);
      background: rgba(248, 250, 252, 0.5);
      min-height: 64px;
      display: flex;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      width: 100%;
      min-height: 48px;
    }

    .vote-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-shrink: 0;
      min-height: 48px;
    }

    .vote-button {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      transition: all 0.3s ease !important;
      color: var(--text-muted) !important;
      position: relative;
      min-width: 64px !important;
      min-height: 48px !important;
      white-space: nowrap !important;
      box-sizing: border-box !important;
      line-height: 1 !important;
    }

    .vote-button.mat-mdc-icon-button {
      width: auto !important;
      height: 48px !important;
      padding: 12px 16px !important;
    }

    .vote-button:hover {
      background: var(--chip-bg) !important;
      transform: scale(1.05);
    }

    .like-button.active {
      background: rgba(76, 175, 80, 0.1) !important;
      color: #4caf50 !important;
    }

    .like-button.active mat-icon {
      color: #4caf50 !important;
    }

    .dislike-button.active {
      background: rgba(244, 67, 54, 0.1) !important;
      color: #f44336 !important;
    }

    .dislike-button.active mat-icon {
      color: #f44336 !important;
    }

    .vote-button mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
    }

    .vote-button .mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    .vote-count {
      font-size: 0.75rem;
      font-weight: 600;
      min-width: 14px;
      text-align: center;
    }

    .vote-button:disabled {
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }

    .vote-button:disabled:hover {
      transform: none !important;
      background: transparent !important;
    }

    .view-details-btn {
      color: var(--primary-color) !important;
      font-weight: 500 !important;
      text-transform: none !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      transition: all 0.3s ease !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      flex-shrink: 0;
      min-height: 48px !important;
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
export class OfertaCardComponent implements OnInit {
  @Input() oferta!: OfertaListaDTO;

  isVoting = false;
  keycloakUser?: KeycloakUser;

  constructor(
    private router: Router,
    private ofertasService: offersService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Obtener información del usuario
    this.authService.waitForUserLoad().subscribe(() => {
      this.keycloakUser = this.authService.keycloakUser || undefined;
      // Cargar votos iniciales si el usuario puede votar
      if (this.canVote()) {
        this.loadVotes();
      }
    });
  }

  get atributosLimitados(): string[] {
    return this.oferta.attributes?.slice(0, 5) || [];
  }

  verDetalle(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/oferta', this.oferta.id]);
  }

  canVote(): boolean {
    // Solo los usuarios logueados pueden votar
    // Las organizaciones no pueden votar, solo estudiantes
    return !!this.keycloakUser &&
      this.keycloakUser.role === 'Student' &&
      !!this.oferta.bidder &&
      this.oferta.bidder.id !== this.keycloakUser.id;
  }

  loadVotes(): void {
    if (!this.canVote()) return;

    this.ofertasService.getVotesOferta(this.oferta.id).subscribe({
      next: (voteResponse: VoteResponseDTO) => {
        this.updateOfertaVotes(voteResponse);
      },
      error: (error) => {
        console.error('Error al cargar votos:', error);
      }
    });
  }

  onLike(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.canVote() || this.isVoting) return;

    this.isVoting = true;

    // Si ya tiene like, quitar el voto
    if (this.oferta.userVote === true) {
      this.ofertasService.removeVoteOferta(this.oferta.id).subscribe({
        next: (voteResponse: VoteResponseDTO) => {
          this.updateOfertaVotes(voteResponse);
          this.isVoting = false;
        },
        error: (error) => {
          console.error('Error al quitar voto:', error);
          this.isVoting = false;
        }
      });
    } else {
      // Dar like
      this.ofertasService.likeOferta(this.oferta.id).subscribe({
        next: (voteResponse: VoteResponseDTO) => {
          this.updateOfertaVotes(voteResponse);
          this.isVoting = false;
        },
        error: (error) => {
          console.error('Error al dar like:', error);
          this.isVoting = false;
        }
      });
    }
  }

  onDislike(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.canVote() || this.isVoting) return;

    this.isVoting = true;

    // Si ya tiene dislike, quitar el voto
    if (this.oferta.userVote === false) {
      this.ofertasService.removeVoteOferta(this.oferta.id).subscribe({
        next: (voteResponse: VoteResponseDTO) => {
          this.updateOfertaVotes(voteResponse);
          this.isVoting = false;
        },
        error: (error) => {
          console.error('Error al quitar voto:', error);
          this.isVoting = false;
        }
      });
    } else {
      // Dar dislike
      this.ofertasService.dislikeOferta(this.oferta.id).subscribe({
        next: (voteResponse: VoteResponseDTO) => {
          this.updateOfertaVotes(voteResponse);
          this.isVoting = false;
        },
        error: (error) => {
          console.error('Error al dar dislike:', error);
          this.isVoting = false;
        }
      });
    }
  }

  private updateOfertaVotes(voteResponse: VoteResponseDTO): void {
    this.oferta.userVote = voteResponse.userVote;
    this.oferta.positiveVotes = voteResponse.positiveVotes;
    this.oferta.negativeVotes = voteResponse.negativeVotes;
    this.oferta.totalScore = voteResponse.totalScore;
  }
}
