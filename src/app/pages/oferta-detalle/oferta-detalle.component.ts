import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { OfertaListaDTO, EstadoAplicacion } from '../../models/oferta.dto';
import { offersService } from '../../services/ofertas.service';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { AplicarDialogComponent } from '../../components/aplicar-dialog/aplicar-dialog.component';

@Component({
  selector: 'app-oferta-detalle',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatChipsModule, MatIconModule],
  template: `
    @if (oferta) {
    <div class="detalle-page">
      <div class="page-header">
        <div class="header-content">
          <button mat-icon-button class="back-button" (click)="volver()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-info">
            <h1 class="job-title">{{ oferta.title }}</h1>
            <div class="company-name">{{ oferta.bidder.name }} {{ oferta.bidder.surname }}</div>
            <div class="job-meta">
              <div class="meta-item">
                <mat-icon>location_on</mat-icon>
                <span>{{ oferta.location }}</span>
              </div>
              <div class="meta-item">
                <mat-icon>work</mat-icon>
                <span>{{ oferta.modality }}</span>
              </div>
              <div class="salary-highlight">
                {{ oferta.estimatedPayment }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-container">
        <div class="main-content">
          <mat-card class="modern-card info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>description</mat-icon>
                Descripción del Puesto
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="description-text">{{ oferta.description }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="modern-card info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>checklist</mat-icon>
                Requisitos
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="requirements-text">{{ oferta.requirements }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="modern-card info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>code</mat-icon>
                Stack Tecnológico
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="tech-grid">
                @for (atributo of oferta.attributes || []; track atributo) {
                <mat-chip class="tech-chip" selected>{{ atributo }}</mat-chip>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="sidebar">
          <mat-card class="modern-card action-card">
            <mat-card-content>
              <div class="action-buttons">
                @if (isEmpresa()) {
                <button
                  mat-raised-button
                  class="view-applicants-button"
                  color="accent"
                  (click)="verAplicantes()"
                >
                  <mat-icon>group</mat-icon>
                  Ver Aplicantes
                </button>
                } @else {
                  @if (oferta.estado === 'APLICADO') {
                  <button mat-raised-button class="applied-button" disabled>
                    <mat-icon>check</mat-icon>
                    Ya Aplicado
                  </button>
                  } @else {
                  <button
                    mat-raised-button
                    class="apply-button"
                    color="primary"
                    (click)="abrirDialogoAplicar()"
                  >
                    <mat-icon>send</mat-icon>
                    Aplicar Ahora
                  </button>
                  }
                }

                <!-- <button mat-stroked-button class="save-button">
                  <mat-icon>bookmark_border</mat-icon>
                  Guardar Oferta
                </button> -->
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="modern-card info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>bolt</mat-icon>
                Informacion Rápida
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-list">
                <div class="info-item">
                  <mat-icon>schedule</mat-icon>
                  <div>
                    <strong>Modalidad</strong>
                    <span>{{ oferta.modality }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>payments</mat-icon>
                  <div>
                    <strong>Salario</strong>
                    <span>{{ oferta.estimatedPayment }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>location_on</mat-icon>
                  <div>
                    <strong>Ubicación</strong>
                    <span>{{ oferta.location }}</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
    }
  `,
  styles: [
    `
      .detalle-page {
        min-height: 100vh;
        background: var(--background-page);
      }

      .page-header {
        background: var(--primary-gradient);
        color: var(--white);
        padding: 40px 0;
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
        align-items: flex-start;
        gap: 20px;
        position: relative;
        z-index: 1;
      }

      .back-button {
        background: var(--glass-white-medium) !important;
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-white-strong);
        color: var(--white) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .header-info {
        flex: 1;
      }

      .job-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 8px 0;
        line-height: 1.2;
      }

      .company-name {
        font-size: 1.2rem;
        font-weight: 500;
        margin-bottom: 16px;
        opacity: 0.9;
      }

      .job-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        align-items: center;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1rem;
        opacity: 0.9;
      }

      .meta-item mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .salary-highlight {
        background: var(--glass-white-medium);
        backdrop-filter: blur(10px);
        padding: 5px 20px;
        border-radius: 25px;
        font-weight: 600;
        font-size: 1.1rem;
        border: 1px solid var(--glass-white-strong);
      }

      .content-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 24px;
        display: grid;
        grid-template-columns: 1fr 350px;
        gap: 32px;
      }

      .main-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .info-card mat-card-header {
        padding-bottom: 16px;
      }

      .info-card mat-card-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 1.3rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .info-card mat-card-title mat-icon {
        color: var(--primary-color);
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .description-text,
      .requirements-text {
        font-size: 1rem;
        line-height: 1.7;
        color: var(--text-secondary);
        margin: 0;
      }

      .tech-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
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

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .action-card {
        position: sticky;
        top: 24px;
      }

      .application-status {
        text-align: center;
        margin-bottom: 24px;
        padding: 20px;
        border-radius: 12px;
      }

      .status-applied {
        background: linear-gradient(135deg, var(--success-color) 0%, var(--success-dark) 100%);
        color: var(--white);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 600;
      }

      .status-available {
        background: linear-gradient(135deg, var(--info-color) 0%, var(--info-dark) 100%);
        color: var(--white);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 600;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .apply-button {
        background: var(--secondary-gradient) !important;
        color: var(--white) !important;
        font-weight: 600 !important;
        text-transform: none !important;
        border-radius: 12px !important;
        padding: 16px !important;
        font-size: 1rem !important;
        box-shadow: 0 8px 24px var(--shadow-primary) !important;
      }

      .apply-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px var(--shadow-primary-hover) !important;
      }

      .applied-button {
        background: var(--border-light) !important;
        color: var(--text-muted) !important;
        font-weight: 500 !important;
        text-transform: none !important;
        border-radius: 12px !important;
        padding: 16px !important;
      }

      .view-applicants-button {
        background: var(--primary-gradient) !important;
        color: var(--white) !important;
        font-weight: 600 !important;
        text-transform: none !important;
        border-radius: 12px !important;
        padding: 16px !important;
        font-size: 1rem !important;
        box-shadow: 0 8px 24px rgba(103, 58, 183, 0.3) !important;
      }

      .view-applicants-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(103, 58, 183, 0.4) !important;
      }

      .save-button {
        border: 2px solid var(--border-light) !important;
        color: var(--text-muted) !important;
        font-weight: 500 !important;
        text-transform: none !important;
        border-radius: 12px !important;
        padding: 14px !important;
      }

      .save-button:hover {
        background: var(--background-light) !important;
        border-color: var(--border-medium) !important;
      }

      .quick-info mat-card-title {
        font-size: 1.1rem;
        color: var(--text-primary);
      }

      .info-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .info-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .info-item mat-icon {
        color: var(--primary-color);
        font-size: 20px;
        width: 20px;
        height: 20px;
        margin-top: 2px;
      }

      .info-item div {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .info-item strong {
        font-size: 0.9rem;
        color: var(--text-primary);
        font-weight: 600;
      }

      .info-item span {
        font-size: 0.9rem;
        color: var(--text-muted);
      }

      @media (max-width: 1024px) {
        .content-container {
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .sidebar {
          order: -1;
        }

        .action-card {
          position: static;
        }
      }

      @media (max-width: 768px) {
        .header-content {
          padding: 0 16px;
        }

        .job-title {
          font-size: 2rem;
        }

        .job-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .content-container {
          padding: 24px 16px;
        }

        .main-content {
          gap: 16px;
        }

        .sidebar {
          gap: 16px;
        }
      }
    `,
  ],
})
export class OfertaDetalleComponent implements OnInit {
  oferta?: OfertaListaDTO;
  usuario?: Usuario;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ofertasService: offersService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ofertasService.getOfertaById(id).subscribe((oferta) => {
      this.oferta = oferta;
    });

    this.usuarioService.getCurrentUser().subscribe((usuario) => {
      this.usuario = usuario;
    });
  }

  volver(): void {
    this.router.navigate(['/ofertas']);
  }

  abrirDialogoAplicar(): void {
    if (!this.oferta || !this.usuario) return;

    const dialogRef = this.dialog.open(AplicarDialogComponent, {
      width: '500px',
      data: { ofertaTitulo: this.oferta.title },
    });

    dialogRef.afterClosed().subscribe((cartaPresentacion) => {
      console.log('El diálogo se cerró');
      console.log('Carta de presentación:', cartaPresentacion);
      console.log('Oferta ID:', this.oferta?.id);
      console.log('Usuario ID:', this.usuario?.id);
        console.log('Enviando aplicación...');
        this.ofertasService.aplicarAOferta({
          offerId: this.oferta!.id,
          studentId: this.usuario!.id,
          customCoverLetter: cartaPresentacion,
        });
        this.oferta!.estado = EstadoAplicacion.APLICADO;
    });
  }

  verAplicantes(): void {
    if (this.oferta) {
      this.router.navigate(['/oferta', this.oferta.id, 'aplicantes']);
    }
  }

  isEmpresa(): boolean {
    return this.authService.isEmpresa();
  }
}
