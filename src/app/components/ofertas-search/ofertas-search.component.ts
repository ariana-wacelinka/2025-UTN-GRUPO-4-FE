import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export interface OfertaSearchParams {
  title?: string;
  description?: string;
  requirements?: number;
  modality?: string;
  location?: string;
  estimatedPayment?: number;
  bidderId?: number;
}

@Component({
  selector: 'app-ofertas-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
  ],
  template: `
    <div class="search-container">
      <mat-expansion-panel class="search-panel" [expanded]="true">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>search</mat-icon>
            <span>Buscar Ofertas Laborales</span>
          </mat-panel-title>
        </mat-expansion-panel-header>

        <form [formGroup]="searchForm" class="search-form">
          <div class="search-grid">
            <!-- Título -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título</mat-label>
              <input
                matInput
                formControlName="title"
                placeholder="Ej: Desarrollador Frontend"
              />
              <mat-icon matPrefix>title</mat-icon>
            </mat-form-field>

            <!-- Descripción -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <input
                matInput
                formControlName="description"
                placeholder="Buscar en descripción"
              />
              <mat-icon matPrefix>description</mat-icon>
            </mat-form-field>

            <!-- Modalidad -->
            <mat-form-field appearance="outline">
              <mat-label>Modalidad</mat-label>
              <mat-select formControlName="modality">
                <mat-option value="">Todas</mat-option>
                <mat-option value="remoto">Remoto</mat-option>
                <mat-option value="hibrido">Híbrido</mat-option>
                <mat-option value="presencial">Presencial</mat-option>
              </mat-select>
              <mat-icon matPrefix>work</mat-icon>
            </mat-form-field>

            <!-- Ubicación -->
            <mat-form-field appearance="outline">
              <mat-label>Ubicación</mat-label>
              <input
                matInput
                formControlName="location"
                placeholder="Ej: Buenos Aires"
              />
              <mat-icon matPrefix>location_on</mat-icon>
            </mat-form-field>

            <!-- Pago Estimado -->
            <!-- <mat-form-field appearance="outline">
              <mat-label>Pago Estimado (mínimo)</mat-label>
              <input
                matInput
                type="number"
                formControlName="estimatedPayment"
                placeholder="0"
              />
              <mat-icon matPrefix>attach_money</mat-icon>
            </mat-form-field> -->

            <!-- Requirements -->
            <mat-form-field appearance="outline">
              <mat-label>Requisitos</mat-label>
              <input
                matInput
                type="number"
                formControlName="requirements"
                placeholder="ID"
              />
              <mat-icon matPrefix>assignment</mat-icon>
            </mat-form-field>
          </div>

          <div class="search-actions">
            <button
              mat-raised-button
              color="primary"
              type="button"
              (click)="onSearch()"
              class="search-btn"
            >
              <mat-icon>search</mat-icon>
              Buscar
            </button>
            <button
              mat-button
              type="button"
              (click)="onClear()"
              class="clear-btn"
            >
              <mat-icon>clear</mat-icon>
              Limpiar
            </button>
          </div>
        </form>
      </mat-expansion-panel>
    </div>
  `,
  styles: [
    `
      .search-container {
        margin-bottom: 24px;
      }

      .search-panel {
        background: var(--white);
        border-radius: 12px;
        box-shadow: 0 2px 8px var(--shadow-light);
      }

      ::ng-deep .search-panel .mat-expansion-panel-header {
        padding: 16px 24px;
      }

      ::ng-deep .search-panel .mat-expansion-panel-body {
        padding: 0 24px 24px;
      }

      ::ng-deep .mat-expansion-panel-header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-primary);
        font-weight: 600;
      }

      ::ng-deep .mat-expansion-panel-header-title mat-icon {
        color: var(--primary-color);
      }

      .search-form {
        margin-top: 16px;
      }

      .search-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      .search-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding-top: 8px;
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

      .clear-btn {
        color: var(--text-muted) !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      ::ng-deep .mat-form-field-prefix {
        margin-right: 8px;
      }

      ::ng-deep .mat-form-field-prefix mat-icon {
        color: var(--primary-color);
      }

      @media (max-width: 768px) {
        .search-grid {
          grid-template-columns: 1fr;
        }

        .search-actions {
          flex-direction: column;
        }

        .search-btn,
        .clear-btn {
          width: 100%;
          justify-content: center !important;
        }
      }
    `,
  ],
})
export class OfertasSearchComponent {
  @Output() search = new EventEmitter<OfertaSearchParams>();

  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      title: [''],
      description: [''],
      requirements: [null],
      modality: [''],
      location: [''],
      estimatedPayment: [null],
      bidderId: [null],
    });

    // Auto-search cuando el usuario escribe (con debounce)
    this.searchForm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.onSearch();
      });
  }

  onSearch(): void {
    const params = this.getSearchParams();
    this.search.emit(params);
  }

  onClear(): void {
    this.searchForm.reset({
      title: '',
      description: '',
      requirements: null,
      modality: '',
      location: '',
      estimatedPayment: null,
      bidderId: null,
    });
    this.search.emit({});
  }

  private getSearchParams(): OfertaSearchParams {
    const formValue = this.searchForm.value;
    const params: OfertaSearchParams = {};

    // Solo agregar parámetros que tienen valor
    Object.keys(formValue).forEach((key) => {
      const value = formValue[key];
      if (value !== null && value !== '' && value !== undefined) {
        params[key as keyof OfertaSearchParams] = value;
      }
    });

    return params;
  }
}
