import { Component, OnInit, signal, computed, OnDestroy, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Importar servicios y DTOs existentes
import { offersService } from '../../services/ofertas.service';
import { OfertaListaDTO, PagedResponseDTO } from '../../models/oferta.dto';
import { EmpresasService } from '../../services/empresas.service';

// Importar el nuevo servicio
import { OfertasLaboralesService } from '../../services/ofertas-laborales.service';
import { OfertaLaboralDTO, ModalidadTrabajo } from '../../models/oferta-laboral.dto';

// Importar el componente de formulario
import { OfertaFormDialogComponent, OfertaFormDialogData } from '../oferta-form-dialog/oferta-form-dialog.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-empresa-ofertas-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="ofertas-manager-container">
      <!-- Header Section -->
      <div class="ofertas-header">
        <div class="header-content">
          <h2 class="section-title">
            <mat-icon class="section-icon">work</mat-icon>
            {{ isOwnProfile ? 'Mis Ofertas Laborales' : 'Publicaciones' }}
          </h2>
          <p class="section-subtitle">
            {{ isOwnProfile ? 'Gestiona todas tus publicaciones de trabajo' : 'Ofertas laborales publicadas' }}
          </p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-container" *ngIf="ofertas().length > 0 && isOwnProfile">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon active">work</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ ofertasActivas().length }}</span>
                <span class="stat-label">Ofertas Activas</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon total">list_alt</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ ofertas().length }}</span>
                <span class="stat-label">Total Ofertas</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon pending">people</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ totalAplicantes() }}</span>
                <span class="stat-label">Aplicantes</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Lista de Ofertas / Loading -->
      <ng-container *ngIf="isLoading(); else loaded">
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando ofertas...</p>
        </div>
      </ng-container>

      <ng-template #loaded>
        <div class="ofertas-list" *ngIf="ofertas().length > 0; else emptyState">
          <div class="ofertas-grid">
            @for (oferta of ofertas(); track oferta.id) {
              <mat-card class="oferta-empresa-card modern-card">
                <!-- Header de la oferta -->
                <div class="card-header">
                  <div class="title-section">
                    <h3 class="job-title">{{ oferta.title }}</h3>
                    <div class="job-meta">
                      <div class="meta-item">
                        <mat-icon class="meta-icon">location_on</mat-icon>
                        <span>{{ oferta.location }}</span>
                      </div>
                      <div class="meta-item">
                        <mat-icon class="meta-icon">work</mat-icon>
                        <span>{{ oferta.modality }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-actions" *ngIf="isOwnProfile">
                    <button mat-icon-button [matMenuTriggerFor]="menu" class="menu-button">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="editarOferta(oferta)" [disabled]="!canEditOferta(oferta)">
                        <mat-icon>edit</mat-icon>
                        <span>Editar Oferta</span>
                      </button>
                      <button mat-menu-item (click)="verAplicantes(oferta)">
                        <mat-icon>people</mat-icon>
                        <span>Ver Aplicantes</span>
                      </button>
                      <button mat-menu-item (click)="desactivarOferta(oferta)" class="danger-action">
                        <mat-icon>block</mat-icon>
                        <span>Desactivar</span>
                      </button>
                    </mat-menu>
                  </div>
                </div>

                <!-- Contenido de la oferta -->
                <mat-card-content class="card-content">
                  <div class="salary-info">
                    <span class="salary-badge">{{ oferta.estimatedPayment }}</span>
                  </div>

                  <p class="job-description">{{ getDescripcionCorta(oferta.description) }}</p>

                  <!-- Atributos/Skills -->
                  <div class="tech-stack" *ngIf="oferta.attributes && oferta.attributes.length > 0">
                    @for (atributo of getAtributosLimitados(oferta.attributes); track atributo) {
                      <mat-chip class="tech-chip" selected>{{ atributo }}</mat-chip>
                    }
                    @if (oferta.attributes.length > 4) {
                      <span class="more-tech">+{{ oferta.attributes.length - 4 }} más</span>
                    }
                  </div>
                </mat-card-content>

                <!-- Footer de la oferta -->
                <div class="card-footer">
                  <div class="footer-stats" *ngIf="isOwnProfile">
                    <div class="stat-item">
                      <mat-icon class="stat-icon-small">people</mat-icon>
                      <span>{{ getNumeroAplicantes(oferta.id) }} aplicantes</span>
                    </div>
                  </div>
                  <div class="footer-actions" *ngIf="isOwnProfile">
                    <button mat-button class="primary-btn" (click)="verDetalle(oferta)">
                      Ver Publicación
                    </button>
                  </div>
                  <div class="footer-actions" *ngIf="!isOwnProfile">
                    <button mat-button class="primary-btn" (click)="verDetalle(oferta)">
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </mat-card>
            }
          </div>
        </div>
      </ng-template>
      <ng-template #emptyState>
        <div class="empty-state">
          <mat-card class="empty-card">
            <mat-card-content>
              <div class="empty-content">
                <mat-icon class="empty-icon">work_outline</mat-icon>
                <h3>{{ isOwnProfile ? 'No tienes ofertas publicadas' : 'No hay ofertas publicadas' }}</h3>
                <p *ngIf="isOwnProfile">Comienza a atraer talento creando tu primera oferta laboral</p>
                <p *ngIf="!isOwnProfile">Esta empresa aún no ha publicado ofertas laborales</p>
                <button *ngIf="isOwnProfile" mat-raised-button color="primary" class="create-first-offer-btn" (click)="crearNuevaOferta()">
                  <mat-icon>add</mat-icon>
                  Crear Mi Primera Oferta
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./empresa-ofertas-manager.component.scss']
})
export class EmpresaOfertasManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  authService = inject(AuthService);

  // Inputs
  @Input() isOwnProfile: boolean = true; // Por defecto es true para mantener compatibilidad
  @Input() empresaId?: number; // ID de la empresa cuyas ofertas se deben cargar

  // Signals
  ofertas = signal<OfertaListaDTO[]>([]);
  isLoading = signal(false);
  empresaIdSignal = signal<number | null>(null);

  // Computed properties
  ofertasActivas = computed(() =>
    this.ofertas().filter(oferta => {
      // Por ahora, consideramos todas como activas
      // En el futuro se puede agregar un campo 'activa' al DTO
      return true;
    })
  );

  totalAplicantes = computed(() => {
    // Sumar todas las aplicaciones de todas las ofertas
    return this.ofertas().reduce((total, oferta) => {
      return total + (oferta.applyList?.length || 0);
    }, 0);
  });

  // Computed property para obtener todas las aplicaciones de forma reactiva
  todasLasAplicaciones = computed(() => {
    return this.ofertas().flatMap(oferta => oferta.applyList || []);
  });

  // Computed property para aplicaciones agrupadas por oferta
  aplicacionesPorOferta = computed(() => {
    return this.ofertas().map(oferta => ({
      oferta: oferta,
      aplicaciones: oferta.applyList || []
    })).filter(item => item.aplicaciones.length > 0);
  });

  constructor(
    private ofertasService: offersService,
    private empresasService: EmpresasService,
    private ofertasLaboralesService: OfertasLaboralesService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarOfertas();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarOfertas() {
    this.isLoading.set(true);

    // Si se proporcionó un empresaId, usarlo directamente
    if (this.empresaId) {
      this.ofertasService.getoffers({ bidderId: this.empresaId })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: PagedResponseDTO<OfertaListaDTO>) => {
            this.ofertas.set(response.content);
            this.isLoading.set(false);
          },
          error: (error: any) => {
            console.error('Error al cargar ofertas:', error);
            this.isLoading.set(false);
            this.snackBar.open('Error al cargar las ofertas', 'Cerrar', { duration: 3000 });
          }
        });
    } else {
      // Si no se proporciona empresaId, esperar a que el usuario esté cargado
      this.authService.getCurrentUserId()
        .pipe(
          takeUntil(this.destroy$),
          switchMap(userId => this.ofertasService.getoffers({ bidderId: userId }))
        )
        .subscribe({
          next: (response: PagedResponseDTO<OfertaListaDTO>) => {
            this.ofertas.set(response.content);
            this.isLoading.set(false);
          },
          error: (error: any) => {
            console.error('Error al cargar ofertas:', error);
            this.isLoading.set(false);
            this.snackBar.open('Error al cargar las ofertas', 'Cerrar', { duration: 3000 });
          }
        });
    }
  }

  // Métodos de utilidad para el template
  getDescripcionCorta(descripcion: string): string {
    return descripcion.length > 150
      ? descripcion.substring(0, 150) + '...'
      : descripcion;
  }

  getAtributosLimitados(atributos: string[]): string[] {
    return atributos.slice(0, 4);
  }

  getNumeroAplicantes(ofertaId: number): number {
    // Buscar la oferta específica y retornar el número de aplicaciones
    const oferta = this.ofertas().find(o => o.id === ofertaId);
    return oferta?.applyList?.length || 0;
  }

  /**
   * Obtiene todas las aplicaciones de todas las ofertas
   * @returns Array con todas las aplicaciones combinadas
   */
  getAllAplyLists(): any[] {
    return this.ofertas().flatMap(oferta => oferta.applyList || []);
  }

  /**
   * Obtiene todas las aplicaciones agrupadas por oferta
   * @returns Array de objetos con información de la oferta y sus aplicaciones
   */
  getAplyListsByOffer(): Array<{ oferta: OfertaListaDTO, aplicaciones: any[] }> {
    return this.ofertas().map(oferta => ({
      oferta: oferta,
      aplicaciones: oferta.applyList || []
    })).filter(item => item.aplicaciones.length > 0);
  }

  /**
   * Carga aplicaciones detalladas para todas las ofertas desde el servidor
   * Este método puede ser útil si necesitas información más detallada de los aplicantes
   */
  async cargarTodasLasAplicacionesDetalladas(): Promise<any[]> {
    const todasLasAplicaciones: any[] = [];

    for (const oferta of this.ofertas()) {
      try {
        const aplicacionesDetalladas = await this.ofertasService
          .getAplicantesPorOferta(oferta.id)
          .toPromise();

        if (aplicacionesDetalladas?.content) {
          todasLasAplicaciones.push(...aplicacionesDetalladas.content.map(app => ({
            ...app,
            ofertaId: oferta.id,
            ofertaTitulo: oferta.title
          })));
        }
      } catch (error) {
        console.error(`Error al cargar aplicaciones para oferta ${oferta.id}:`, error);
      }
    }

    return todasLasAplicaciones;
  }

  /**
   * Método de utilidad para imprimir todas las aplicaciones en consola
   * Útil para debugging o exportación
   */
  mostrarTodasLasAplicaciones(): void {
    const aplicaciones = this.getAllAplyLists();
    console.log('📋 Todas las aplicaciones:', aplicaciones);
    console.log('📊 Total de aplicaciones:', aplicaciones.length);

    const aplicacionesPorOferta = this.getAplyListsByOffer();
    console.log('📁 Aplicaciones agrupadas por oferta:', aplicacionesPorOferta);

    // También mostrar el computed property
    console.log('🔄 Aplicaciones reactivas:', this.todasLasAplicaciones());
  }

  // Métodos de acción
  crearNuevaOferta() {
    const dialogRef = this.dialog.open(OfertaFormDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        isEditing: false
      } as OfertaFormDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refrescar la lista de ofertas
        this.cargarOfertas();
        this.snackBar.open('Oferta creada exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  verDetalle(oferta: OfertaListaDTO) {
    this.router.navigate(['/oferta', oferta.id]);
  }

  canEditOferta(oferta: OfertaListaDTO): boolean {
    const currentUserId = this.authService.keycloakUser?.id;
    return currentUserId !== undefined && !!oferta.bidder && oferta.bidder.id === currentUserId;
  }

  editarOferta(oferta: OfertaListaDTO) {
    if (!this.canEditOferta(oferta) || !oferta.bidder) {
      this.snackBar.open('No tienes permisos para editar esta oferta', 'Cerrar', { duration: 3000 });
      return;
    }

    // Convertir OfertaListaDTO a OfertaLaboralDTO para el formulario
    const ofertaParaEditar: OfertaLaboralDTO = {
      id: oferta.id,
      title: oferta.title,
      description: oferta.description,
      requirements: oferta.requirements,
      modality: oferta.modality as ModalidadTrabajo,
      location: oferta.location,
      estimatedPayment: this.extractSalaryNumber(oferta.estimatedPayment),
      applyList: [],
      bidder: {
        id: oferta.bidder.id,
        name: oferta.bidder.name,
        imageUrl: oferta.bidder.imageUrl || undefined
      },
      attributes: oferta.attributes || [],
  fechaVencimiento: (oferta as any).fechaVencimiento
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
        // Refrescar la lista de ofertas
        this.cargarOfertas();
        this.snackBar.open('Oferta actualizada exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  verAplicantes(oferta: OfertaListaDTO) {
    this.router.navigate(['/oferta', oferta.id, 'aplicantes']);
  }

  desactivarOferta(oferta: OfertaListaDTO) {
    const dialogData: ConfirmationDialogData = {
      title: 'Desactivar Oferta',
      message: `¿Estás seguro de que quieres desactivar la oferta <strong>"${oferta.title}"</strong>?<br><br>
                     Esta acción hará que la oferta no sea visible para nuevos aplicantes, pero conservará toda la información y aplicaciones existentes.`,
      confirmText: 'Desactivar',
      cancelText: 'Cancelar',
      type: 'warning'
    };

    const confirmDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: dialogData
    });

    confirmDialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isLoading.set(true);

        this.ofertasLaboralesService.desactivarOferta(oferta.id)
          .subscribe(
            (res: OfertaLaboralDTO) => {
              this.isLoading.set(false);
              this.cargarOfertas();
              this.snackBar.open('Oferta desactivada exitosamente', 'Cerrar', { duration: 3000 });
            },
            (error: unknown): void => {
              this.isLoading.set(false);
              console.error('Error al desactivar oferta:', error);
              this.snackBar.open('Error al desactivar la oferta', 'Cerrar', { duration: 3000 });
            }
          );
      }
    });
  }

  // Método auxiliar para extraer número del salario
  private extractSalaryNumber(salarioTexto: string): number {
    // Extraer el primer número del string como "USD 2000-3000" -> 2000
    const matches = salarioTexto.match(/\d+/);
    return matches ? parseInt(matches[0]) : 0;
  }
}
