import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, catchError } from 'rxjs/operators';
import { EmpresasService } from '../../services/empresas.service';
import { of } from 'rxjs';

export interface StudentSearchResult {
  id: number;
  name: string;
  surname: string;
  email: string;
  imageUrl?: string;
  career?: string;
  currentYearLevel?: number;
  institution?: string;
}

@Component({
  selector: 'app-buscar-alumno-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="search-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <mat-icon class="dialog-icon">person_search</mat-icon>
          <h2 mat-dialog-title>Buscar Alumno</h2>
        </div>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="search-section">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Nombre del alumno</mat-label>
            <input 
              matInput 
              [formControl]="searchControl"
              placeholder="Buscar por nombre o apellido..."
              autocomplete="off">
            <mat-icon matPrefix>search</mat-icon>
            <button 
              mat-icon-button 
              matSuffix 
              *ngIf="searchControl.value"
              (click)="clearSearch()"
              type="button">
              <mat-icon>clear</mat-icon>
            </button>
          </mat-form-field>

          <p class="search-hint" *ngIf="!searchControl.value">
            Ingresa al menos 2 caracteres para buscar
          </p>
        </div>

        <div class="results-section">
          <div *ngIf="isSearching()" class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Buscando alumnos...</p>
          </div>

          <div *ngIf="searchError()" class="error-state">
            <mat-icon>error_outline</mat-icon>
            <p>{{searchError()}}</p>
          </div>

          <div *ngIf="!isSearching() && !searchError() && searchControl.value && searchResults().length === 0" 
               class="empty-state">
            <mat-icon>person_off</mat-icon>
            <p>No se encontraron alumnos</p>
            <span class="hint-text">Intenta con otro nombre</span>
          </div>

          <div *ngIf="!isSearching() && searchResults().length > 0" class="results-list">
            <div *ngFor="let student of searchResults()" 
                 class="student-result-card"
                 (click)="selectStudent(student)">
              <div class="student-avatar">
                <img [src]="student.imageUrl || getDefaultAvatar(student.name, student.surname)" 
                     [alt]="student.name + ' ' + student.surname"
                     (error)="onImageError($event, student.name, student.surname)">
              </div>
              <div class="student-details">
                <h4 class="student-name">{{student.name}} {{student.surname}}</h4>
                <p class="student-email">
                  <mat-icon>email</mat-icon>
                  {{student.email}}
                </p>
                <p class="student-career" *ngIf="student.career">
                  <mat-icon>school</mat-icon>
                  {{student.career}}
                  <span *ngIf="student.currentYearLevel"> - {{student.currentYearLevel}}º año</span>
                </p>
                <p class="student-institution" *ngIf="student.institution">
                  <mat-icon>location_city</mat-icon>
                  {{student.institution}}
                </p>
              </div>
              <div class="select-action">
                <mat-icon>chevron_right</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close class="cancel-button">
          Cancelar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .search-dialog {
      width: 100%;
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--glass-border);

      .header-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .dialog-icon {
          font-size: 2rem;
          width: 2rem;
          height: 2rem;
          color: var(--primary-color);
        }

        h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }
      }

      .close-button {
        color: var(--text-secondary);

        &:hover {
          color: var(--text-primary);
        }
      }
    }

    .dialog-content {
      padding: 24px !important;
      max-height: 60vh;
      overflow-y: auto;

      .search-section {
        margin-bottom: 24px;

        .search-field {
          width: 100%;
        }

        .search-hint {
          margin: 8px 0 0 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      }

      .results-section {
        min-height: 200px;

        .loading-state,
        .error-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;

          mat-icon {
            font-size: 3rem;
            width: 3rem;
            height: 3rem;
            margin-bottom: 16px;
            opacity: 0.6;
          }

          p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 1rem;
          }

          .hint-text {
            margin-top: 8px;
            font-size: 0.875rem;
            color: var(--text-secondary);
            opacity: 0.8;
          }
        }

        .loading-state mat-icon {
          color: var(--primary-color);
        }

        .error-state mat-icon {
          color: var(--error-color);
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .student-result-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: var(--glass-white);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: var(--chip-bg);
              border-color: var(--primary-color);
              transform: translateX(4px);
              box-shadow: var(--shadow-light);
            }

            .student-avatar {
              width: 60px;
              height: 60px;
              flex-shrink: 0;

              img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid var(--primary-color);
              }
            }

            .student-details {
              flex: 1;
              min-width: 0;

              .student-name {
                margin: 0 0 8px 0;
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--text-primary);
              }

              .student-email,
              .student-career,
              .student-institution {
                display: flex;
                align-items: center;
                gap: 6px;
                margin: 4px 0;
                font-size: 0.875rem;
                color: var(--text-secondary);

                mat-icon {
                  font-size: 1rem;
                  width: 1rem;
                  height: 1rem;
                  color: var(--primary-color);
                }
              }
            }

            .select-action {
              flex-shrink: 0;

              mat-icon {
                color: var(--text-secondary);
                transition: color 0.3s ease;
              }
            }

            &:hover .select-action mat-icon {
              color: var(--primary-color);
            }
          }
        }
      }
    }

    .dialog-actions {
      padding: 16px 24px !important;
      background: var(--muted-bg);
      border-top: 1px solid var(--glass-border);
      justify-content: flex-end;

      .cancel-button {
        color: var(--text-secondary) !important;
        font-weight: 500 !important;
        text-transform: none !important;
        border-radius: var(--border-radius-small) !important;

        &:hover {
          background: var(--chip-bg) !important;
          color: var(--text-primary) !important;
        }
      }
    }

    @media (max-width: 768px) {
      .search-dialog {
        min-width: unset;
        max-width: 100%;
        width: 100vw;
      }

      .dialog-header {
        padding: 16px;

        .header-content {
          .dialog-icon {
            font-size: 1.5rem;
            width: 1.5rem;
            height: 1.5rem;
          }

          h2 {
            font-size: 1.2rem;
          }
        }
      }

      .dialog-content {
        padding: 16px !important;

        .results-section {
          .results-list {
            .student-result-card {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;

              .student-avatar {
                width: 50px;
                height: 50px;
              }

              .select-action {
                display: none;
              }
            }
          }
        }
      }
    }
  `]
})
export class BuscarAlumnoDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  searchControl = new FormControl('');
  searchResults = signal<StudentSearchResult[]>([]);
  isSearching = signal(false);
  searchError = signal<string | null>(null);

  constructor(
    public dialogRef: MatDialogRef<BuscarAlumnoDialogComponent>,
    private empresasService: EmpresasService
  ) {}

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        if (searchTerm && searchTerm.trim().length >= 2) {
          this.buscarAlumnos(searchTerm.trim());
        } else {
          this.searchResults.set([]);
          this.searchError.set(null);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buscarAlumnos(searchTerm: string) {
    this.isSearching.set(true);
    this.searchError.set(null);

    this.empresasService.buscarEstudiantes(searchTerm)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error al buscar estudiantes:', error);
          this.searchError.set('Error al buscar estudiantes. Intenta nuevamente.');
          this.isSearching.set(false);
          return of({ content: [] });
        })
      )
      .subscribe(response => {
        const students = response.content || [];
        const studentsFiltered = students.filter((user: any) => 
          user.role && user.role.toLowerCase() === 'student'
        );
        this.searchResults.set(studentsFiltered);
        this.isSearching.set(false);
      });
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.searchResults.set([]);
    this.searchError.set(null);
  }

  selectStudent(student: StudentSearchResult) {
    this.dialogRef.close(student);
  }

  getDefaultAvatar(name: string, surname: string): string {
    const fullName = `${name} ${surname}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=667eea&color=fff&size=150`;
  }

  onImageError(event: Event, name: string, surname: string) {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultAvatar(name, surname);
  }
}
