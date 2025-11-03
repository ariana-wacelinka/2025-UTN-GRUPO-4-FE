import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { OfertaListaDTO, EstadoAplicacion } from '../../models/oferta.dto';
import { offersService } from '../../services/ofertas.service';
import { KeycloakUser } from '../../models/keycloak-user.model';
import { AuthService } from '../../services/auth.service';
import { AplicarDialogComponent } from '../../components/aplicar-dialog/aplicar-dialog.component';
import { OfertaFormDialogComponent, OfertaFormDialogData } from '../../components/oferta-form-dialog/oferta-form-dialog.component';
import { OfertaLaboralDTO, ModalidadTrabajo } from '../../models/oferta-laboral.dto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs';

@Component({
  selector: 'app-oferta-detalle',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, MatSnackBarModule],
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
                @if (isMyOffer()) {
                <button
                  mat-raised-button
                  class="edit-offer-button"
                  color="primary"
                  (click)="editarOferta()"
                >
                  <mat-icon>edit</mat-icon>
                  Editar Oferta
                </button>
                @if (canViewApplicants()) {
                <button
                  mat-raised-button
                  class="view-applicants-button"
                  color="accent"
                  (click)="verAplicantes()"
                >
                  <mat-icon>group</mat-icon>
                  Ver Aplicantes
                </button>
                }
                } @else {
                  @if (!canApplyToOffer()) {
                    <!-- Mensaje informativo cuando no se puede aplicar desde la plataforma -->
                    <div class="external-application-notice">
                      <mat-icon>info</mat-icon>
                      <div class="notice-content">
                        @if (isUsuarioAlumno() && isOfertaDeAlumno()) {
                          <h4>Aplicación Externa</h4>
                          <p>Esta oferta fue publicada por otro estudiante. Para aplicar, contacta directamente usando los datos proporcionados en la descripción.</p>
                        } @else if (!isUsuarioAlumno()) {
                          <h4>Solo para Estudiantes</h4>
                          <p>Las organizaciones no pueden aplicar a ofertas. Esta funcionalidad está reservada exclusivamente para estudiantes.</p>
                        } @else {
                          <h4>No Disponible</h4>
                          <p>No puedes aplicar a esta oferta.</p>
                        }
                      </div>
                    </div>
                  } @else {
                    @if (loadingApplicationStatus) {
                    <!-- Botón de carga mientras verifica el estado o aplica -->
                    <button mat-raised-button class="loading-button" disabled>
                      @if (isApplying) {
                        <ng-container>
                          <mat-icon>send</mat-icon>
                          Enviando aplicación...
                        </ng-container>
                      } @else {
                        <ng-container>
                          <mat-icon>hourglass_empty</mat-icon>
                          Verificando...
                        </ng-container>
                      }
                    </button>
                    } @else if (oferta.estado === 'APLICADO') {
                    <button mat-raised-button class="applied-button" disabled>
                      <mat-icon>check</mat-icon>
                      Ya Aplicado
                    </button>
                    } @else {
                    <button
                      mat-raised-button
                      class="apply-button"
                      color="primary"
                      [disabled]="!dataLoaded"
                      (click)="abrirDialogoAplicar()"
                    >
                      <mat-icon>send</mat-icon>
                      Aplicar Ahora
                    </button>
                    }
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

      .external-application-notice {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border-left: 4px solid #2196f3;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      .external-application-notice mat-icon {
        color: #2196f3;
        font-size: 28px;
        width: 28px;
        height: 28px;
        flex-shrink: 0;
      }

      .notice-content h4 {
        margin: 0 0 8px 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1976d2;
      }

      .notice-content p {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.5;
        color: #424242;
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

      .loading-button {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%) !important;
        color: #718096 !important;
        font-weight: 500 !important;
        text-transform: none !important;
        border-radius: 12px !important;
        padding: 16px !important;
        cursor: not-allowed !important;
      }

      .loading-button mat-icon {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
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

      .edit-offer-button {
        background: var(--secondary-gradient) !important;
        color: var(--white) !important;
        font-weight: 600 !important;
        text-transform: none !important;
        border-radius: 12px !important;
        padding: 16px !important;
        font-size: 1rem !important;
        box-shadow: 0 8px 24px var(--shadow-primary) !important;
      }

      .edit-offer-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px var(--shadow-primary-hover) !important;
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
  keycloakUser?: KeycloakUser;
  loadingApplicationStatus = true; // Estado de carga para verificar si ya aplicó
  dataLoaded = false; // Para controlar si los datos necesarios ya están cargados
  isApplying = false; // Para mostrar cuando se está enviando la aplicación

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ofertasService: offersService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Cargar la oferta
    this.ofertasService.getOfertaById(id).subscribe((oferta) => {
      this.oferta = oferta;
      this.checkIfDataLoaded(); // Verificar si ya tenemos todos los datos
    });

    // Esperar a que el usuario esté cargado y luego obtenerlo
    this.authService.waitForUserLoad().subscribe(() => {
      this.keycloakUser = this.authService.keycloakUser || undefined;
      this.checkIfDataLoaded(); // Verificar si ya tenemos todos los datos
    });
  }

  volver(): void {
    this.router.navigate(['/ofertas']);
  }

  abrirDialogoAplicar(): void {
    if (!this.oferta || !this.keycloakUser) return;

    const dialogRef = this.dialog.open(AplicarDialogComponent, {
      width: '500px',
      data: { ofertaTitulo: this.oferta.title },
    });

    dialogRef.afterClosed().subscribe((cartaPresentacion) => {
      console.log('El diálogo se cerró');
      console.log('Carta de presentación:', cartaPresentacion);
      console.log('Oferta ID:', this.oferta?.id);
      console.log('Usuario ID:', this.keycloakUser?.id);
        console.log('Enviando aplicación...');
        // Mostrar estado de carga mientras se aplica
        this.isApplying = true;
        this.loadingApplicationStatus = true;

        this.ofertasService.aplicarAOferta({
          offerId: this.oferta!.id,
          studentId: this.keycloakUser!.id,
          customCoverLetter: cartaPresentacion,
        }).subscribe({
          next: (response) => {
            console.log('✅ Aplicación enviada exitosamente:', response);
            // Actualizar el estado inmediatamente después de aplicar
            if (this.oferta) {
              this.oferta.estado = EstadoAplicacion.APLICADO;
            }
            this.isApplying = false;
            this.loadingApplicationStatus = false;
          },
          error: (error) => {
            console.error('❌ Error al aplicar a la oferta:', error);
            this.isApplying = false;
            this.loadingApplicationStatus = false;
            // Aquí puedes agregar manejo de errores, como mostrar un mensaje al usuario
          }
        });
    });
  }

  verAplicantes(): void {
    if (this.oferta) {
      this.router.navigate(['/oferta', this.oferta.id, 'aplicantes']);
    }
  }

  editarOferta(): void {
    if (!this.oferta || !this.isMyOffer()) {
      this.snackBar.open('No tienes permisos para editar esta oferta', 'Cerrar', { duration: 3000 });
      return;
    }

    // Convertir OfertaListaDTO a OfertaLaboralDTO para el formulario
    const ofertaParaEditar: OfertaLaboralDTO = {
      id: this.oferta.id,
      title: this.oferta.title,
      description: this.oferta.description,
      requirements: this.oferta.requirements,
      modality: this.oferta.modality as ModalidadTrabajo,
      location: this.oferta.location,
      estimatedPayment: this.extractSalaryNumber(this.oferta.estimatedPayment),
      applyList: [],
      bidder: {
        id: this.oferta.bidder.id,
        name: this.oferta.bidder.name,
        industry: 'Tecnología',
        imageUrl: this.oferta.bidder.imageUrl || undefined
      },
      attributes: this.oferta.attributes || []
    } as any;

    const dialogRef = this.dialog.open(OfertaFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        isEditing: true,
        oferta: ofertaParaEditar
      } as OfertaFormDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recargar la oferta para mostrar los cambios
        this.ngOnInit();
        this.snackBar.open('Oferta actualizada exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private extractSalaryNumber(salarioTexto: string): number {
    const matches = salarioTexto.match(/\d+/);
    return matches ? parseInt(matches[0]) : 0;
  }

  isMyOffer(): boolean {
    return this.oferta?.bidder.id === this.keycloakUser?.id;
  }

  /**
   * Verifica si la oferta fue publicada por un alumno
   */
  isOfertaDeAlumno(): boolean {
    return this.oferta?.bidder.role === 'Student';
  }

  /**
   * Verifica si el usuario actual es un alumno
   */
  isUsuarioAlumno(): boolean {
    return this.keycloakUser?.role === 'Student';
  }

  /**
   * Verifica si el usuario puede aplicar a la oferta
   * Solo los alumnos pueden aplicar, y NO pueden aplicar si la oferta es de otro alumno
   * Las empresas/organizaciones NO pueden aplicar a ofertas
   */
  canApplyToOffer(): boolean {
    // Si es mi propia oferta, no puedo aplicar
    if (this.isMyOffer()) {
      return false;
    }

    // Solo los alumnos pueden aplicar a ofertas
    if (!this.isUsuarioAlumno()) {
      return false;
    }

    // Si soy alumno y la oferta es de otro alumno, no puedo aplicar desde la plataforma
    if (this.isUsuarioAlumno() && this.isOfertaDeAlumno()) {
      return false;
    }

    // Si llegamos aquí, soy alumno y la oferta NO es de otro alumno, puedo aplicar
    return true;
  }

  /**
   * Verifica si debe mostrarse el botón "Ver Aplicantes"
   * NO se muestra si el usuario es alumno (independientemente de si es su oferta)
   */
  canViewApplicants(): boolean {
    // Si es mi oferta Y no soy alumno, puedo ver aplicantes
    return this.isMyOffer() && !this.isUsuarioAlumno();
  }

  /**
   * Verifica si todos los datos necesarios están cargados y procede con la verificación
   */
  private checkIfDataLoaded(): void {
    if (this.oferta && this.keycloakUser && !this.dataLoaded) {
      this.dataLoaded = true;
      this.verificarEstadoAplicacion();
    }
  }

  /**
   * Verifica si el usuario ya aplicó a esta oferta y actualiza el estado
   */
  private verificarEstadoAplicacion(): void {
    // No verificar si es nuestra propia oferta
    if (this.isMyOffer()) {
      this.loadingApplicationStatus = false;
      return;
    }

    // No verificar si no puede aplicar (ej: alumno viendo oferta de otro alumno)
    if (!this.canApplyToOffer()) {
      this.loadingApplicationStatus = false;
      return;
    }

    // Asegurarse de que tenemos los datos necesarios
    if (!this.oferta || !this.keycloakUser) {
      return;
    }

    this.ofertasService.alumnoYaAplico(this.oferta.id, this.keycloakUser.id).subscribe({
      next: (yaAplico) => {
        if (yaAplico && this.oferta) {
          this.oferta.estado = EstadoAplicacion.APLICADO;
        } else if (this.oferta) {
          this.oferta.estado = EstadoAplicacion.NO_APLICADO;
        }
        this.loadingApplicationStatus = false;
      },
      error: (error) => {
        console.error('❌ Error al verificar estado de aplicación:', error);
        this.loadingApplicationStatus = false;
        // En caso de error, asumir que no ha aplicado
        if (this.oferta) {
          this.oferta.estado = EstadoAplicacion.NO_APLICADO;
        }
      }
    });
  }
}
