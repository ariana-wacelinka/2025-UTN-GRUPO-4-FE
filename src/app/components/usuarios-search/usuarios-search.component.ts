import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UsuarioService, PagedUserSearchResponse } from '../../services/usuario.service';
import { UsuarioDTO } from '../../models/usuario.dto';

@Component({
  selector: 'app-usuarios-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="usuarios-search-container">
      <mat-card class="search-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person_search</mat-icon>
            Buscar Usuarios
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="searchForm" class="search-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Buscar por nombre o apellido</mat-label>
              <input
                matInput
                formControlName="search"
                placeholder="Ej: Juan Pérez"
                (keyup.enter)="onSearch()"
              />
              <mat-icon matPrefix>search</mat-icon>
              @if (searchForm.get('search')?.value) {
                <button
                  matSuffix
                  mat-icon-button
                  type="button"
                  (click)="onClear()"
                  aria-label="Limpiar búsqueda"
                >
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>

            <div class="search-actions">
              <button
                mat-raised-button
                color="primary"
                type="button"
                (click)="onSearch()"
                [disabled]="!searchForm.get('search')?.value || isLoading"
                class="search-btn"
              >
                <mat-icon>search</mat-icon>
                Buscar
              </button>
            </div>
          </form>

          <!-- Loading State -->
          @if (isLoading) {
            <div class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Buscando usuarios...</p>
            </div>
          }

          <!-- Results -->
          @if (!isLoading && usuarios.length > 0) {
            <div class="results-container">
              <div class="results-header">
                <h3>Resultados ({{ totalElements }})</h3>
              </div>

              <mat-list class="usuarios-list">
                @for (usuario of usuarios; track usuario.id) {
                  <mat-list-item
                    class="usuario-item"
                    (click)="verPerfil(usuario)"
                  >
                    <mat-icon matListItemIcon class="user-icon">
                      {{ getRoleIcon(usuario.role) }}
                    </mat-icon>
                    <div matListItemTitle class="user-name">
                      {{ usuario.name }} {{ usuario.surname }}
                      <span class="role-badge" [class]="getRoleBadgeClass(usuario.role)">
                        {{ getRoleLabel(usuario.role) }}
                      </span>
                    </div>
                    <div matListItemLine class="user-email">
                      {{ usuario.email }}
                    </div>
                    <button
                      matListItemMeta
                      mat-icon-button
                      (click)="verPerfil(usuario); $event.stopPropagation()"
                    >
                      <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </mat-list-item>
                }
              </mat-list>

              <!-- Pagination Info -->
              @if (totalPages > 1) {
                <div class="pagination-info">
                  Página {{ currentPage + 1 }} de {{ totalPages }}
                </div>
              }
            </div>
          }

          <!-- Empty State -->
          @if (!isLoading && searchPerformed && usuarios.length === 0) {
            <div class="empty-state">
              <mat-icon class="empty-icon">person_off</mat-icon>
              <h3>No se encontraron usuarios</h3>
              <p>Intenta con otros términos de búsqueda</p>
            </div>
          }

          <!-- Initial State -->
          @if (!isLoading && !searchPerformed) {
            <div class="initial-state">
              <mat-icon class="initial-icon">person_search</mat-icon>
              <p>Ingresa un nombre o apellido para buscar usuarios</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .usuarios-search-container {
        margin-bottom: 24px;
      }

      .search-card {
        background: var(--white);
        border-radius: 12px;
        box-shadow: 0 2px 8px var(--shadow-light);
      }

      ::ng-deep .search-card .mat-mdc-card-header {
        padding: 20px 24px;
        border-bottom: 1px solid var(--shadow-black);
      }

      ::ng-deep .search-card .mat-mdc-card-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-primary);
        font-weight: 600;
        font-size: 1.25rem;
        margin: 0;
      }

      ::ng-deep .search-card .mat-mdc-card-title mat-icon {
        color: var(--primary-color);
      }

      ::ng-deep .search-card .mat-mdc-card-content {
        padding: 24px;
      }

      .search-form {
        margin-bottom: 16px;
      }

      .full-width {
        width: 100%;
      }

      .search-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
      }

      .search-btn {
        background: var(--primary-gradient) !important;
        color: var(--white) !important;
        font-weight: 500 !important;
        padding: 0 24px !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .loading-state,
      .empty-state,
      .initial-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-muted);
      }

      .loading-state p,
      .empty-state p,
      .initial-state p {
        margin-top: 16px;
        font-size: 0.95rem;
      }

      .empty-icon,
      .initial-icon {
        font-size: 64px !important;
        width: 64px !important;
        height: 64px !important;
        opacity: 0.5;
      }

      .empty-state h3 {
        font-size: 1.25rem;
        margin: 16px 0 8px;
        color: var(--text-light);
      }

      .results-container {
        margin-top: 20px;
      }

      .results-header {
        padding-bottom: 12px;
        border-bottom: 2px solid var(--primary-color);
        margin-bottom: 16px;
      }

      .results-header h3 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1.1rem;
        font-weight: 600;
      }

      .usuarios-list {
        padding: 0 !important;
      }

      .usuario-item {
        cursor: pointer;
        border-radius: 8px;
        margin-bottom: 8px;
        transition: all 0.3s ease;
        border: 1px solid var(--shadow-black);
        padding: 12px 16px !important;
        height: auto !important;
      }

      .usuario-item:hover {
        background: var(--chip-bg);
        border-color: var(--primary-color);
        transform: translateX(4px);
      }

      .user-icon {
        color: var(--primary-color) !important;
        margin-right: 16px !important;
      }

      .user-name {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .role-badge {
        font-size: 0.7rem;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .role-badge.estudiante {
        background: #e3f2fd;
        color: #1976d2;
      }

      .role-badge.organizacion {
        background: #f3e5f5;
        color: #7b1fa2;
      }

      .role-badge.default {
        background: #f5f5f5;
        color: #616161;
      }

      .user-email {
        color: var(--text-muted);
        font-size: 0.875rem;
      }

      ::ng-deep .usuario-item .mat-mdc-list-item-meta {
        margin-left: auto;
      }

      .pagination-info {
        text-align: center;
        padding: 16px;
        color: var(--text-muted);
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        .search-actions {
          width: 100%;
        }

        .search-btn {
          width: 100%;
          justify-content: center !important;
        }
      }
    `,
  ],
})
export class UsuariosSearchComponent implements OnInit {
  searchForm: FormGroup;
  usuarios: UsuarioDTO[] = [];
  isLoading = false;
  searchPerformed = false;
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    // Auto-search cuando el usuario escribe (con debounce)
    this.searchForm.get('search')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        if (value && value.trim().length >= 2) {
          this.onSearch();
        } else if (!value || value.trim().length === 0) {
          this.usuarios = [];
          this.searchPerformed = false;
        }
      });
  }

  onSearch(): void {
    const searchTerm = this.searchForm.get('search')?.value?.trim();

    if (!searchTerm || searchTerm.length < 2) {
      return;
    }

    this.isLoading = true;
    this.searchPerformed = true;

    this.usuarioService.searchUsers(searchTerm, this.currentPage, 10).subscribe({
      next: (response: PagedUserSearchResponse) => {
        this.usuarios = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al buscar usuarios:', error);
        this.usuarios = [];
        this.isLoading = false;
      },
    });
  }

  onClear(): void {
    this.searchForm.reset({ search: '' });
    this.usuarios = [];
    this.searchPerformed = false;
    this.totalElements = 0;
    this.totalPages = 0;
    this.currentPage = 0;
  }

  verPerfil(usuario: UsuarioDTO): void {
    // Determinar la ruta según el rol del usuario
    const role = usuario.role?.toLowerCase();

    if (role === 'organizacion' || role === 'organization' || role === 'empresa') {
      // Navegar al perfil de empresa
      this.router.navigate(['/perfil-empresa', usuario.id]);
    } else {
      // Por defecto, navegar al perfil de estudiante/alumno
      this.router.navigate(['/perfil', usuario.id]);
    }
  }

  getRoleIcon(role: string): string {
    const roleLower = role?.toLowerCase();
    if (roleLower === 'organizacion' || roleLower === 'organization' || roleLower === 'empresa') {
      return 'business';
    }
    return 'person';
  }

  getRoleLabel(role: string): string {
    const roleLower = role?.toLowerCase();
    if (roleLower === 'organizacion' || roleLower === 'organization' || roleLower === 'empresa') {
      return 'Empresa';
    }
    if (roleLower === 'estudiante' || roleLower === 'student') {
      return 'Estudiante';
    }
    return role || 'Usuario';
  }

  getRoleBadgeClass(role: string): string {
    const roleLower = role?.toLowerCase();
    if (roleLower === 'organizacion' || roleLower === 'organization' || roleLower === 'empresa') {
      return 'organizacion';
    }
    if (roleLower === 'estudiante' || roleLower === 'student') {
      return 'estudiante';
    }
    return 'default';
  }
}
