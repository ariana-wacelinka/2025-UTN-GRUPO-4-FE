import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { BuscarAlumnoDialogComponent, StudentSearchResult } from '../buscar-alumno-dialog/buscar-alumno-dialog.component';

export interface VincularEstudianteDialogData {
  organizationId: number;
}

export interface VincularEstudianteResult {
  studentId: number;
  recognitionType?: string;
  studentInfo: StudentSearchResult;
}

@Component({
  selector: 'app-vincular-estudiante-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatCardModule
  ],
  template: `
    <div class="vincular-estudiante-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon class="title-icon">person_add</mat-icon>
          Vincular Estudiante a la Empresa
        </h2>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <mat-stepper [linear]="true" #stepper>
          <!-- Paso 1: Seleccionar Estudiante -->
          <mat-step [completed]="selectedStudent() !== null">
            <ng-template matStepLabel>Seleccionar Estudiante</ng-template>
            
            <div class="step-content">
              <div class="step-description">
                <mat-icon>search</mat-icon>
                <p>Busca y selecciona el estudiante que deseas vincular a tu empresa</p>
              </div>

              <div *ngIf="!selectedStudent()" class="search-prompt">
                <button mat-raised-button color="primary" (click)="abrirBusquedaEstudiante()" class="search-button">
                  <mat-icon>person_search</mat-icon>
                  Buscar Estudiante
                </button>
              </div>

              <div *ngIf="selectedStudent()" class="student-selected-card">
                <mat-card>
                  <mat-card-header>
                    <img mat-card-avatar 
                         [src]="selectedStudent()!.imageUrl || getDefaultAvatar(selectedStudent()!.name, selectedStudent()!.surname)" 
                         [alt]="selectedStudent()!.name + ' ' + selectedStudent()!.surname">
                    <mat-card-title>{{ selectedStudent()!.name }} {{ selectedStudent()!.surname }}</mat-card-title>
                    <mat-card-subtitle>
                      <div class="student-details">
                        <span *ngIf="selectedStudent()!.career">
                          <mat-icon>school</mat-icon>
                          {{ selectedStudent()!.career }}
                          <span *ngIf="selectedStudent()!.currentYearLevel"> - {{ selectedStudent()!.currentYearLevel }}º año</span>
                        </span>
                        <span>
                          <mat-icon>email</mat-icon>
                          {{ selectedStudent()!.email }}
                        </span>
                      </div>
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-actions>
                    <button mat-button color="warn" (click)="clearSelectedStudent()">
                      <mat-icon>close</mat-icon>
                      Cambiar Estudiante
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>

              <div class="step-actions">
                <button mat-button mat-dialog-close>
                  <mat-icon>close</mat-icon>
                  Cancelar
                </button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="!selectedStudent()">
                  <mat-icon>arrow_forward</mat-icon>
                  Siguiente
                </button>
              </div>
            </div>
          </mat-step>

          <!-- Paso 2: Detalles de la Vinculación -->
          <mat-step [completed]="recognitionForm.valid">
            <ng-template matStepLabel>Tipo de Reconocimiento</ng-template>
            
            <div class="step-content">
              <div class="step-description">
                <mat-icon>workspace_premium</mat-icon>
                <p>Define el tipo de reconocimiento o relación laboral (opcional)</p>
              </div>

              <form [formGroup]="recognitionForm" class="recognition-form">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Tipo de Reconocimiento</mat-label>
                  <input 
                    matInput 
                    formControlName="recognitionType" 
                    placeholder="ej. Pasantía, Colaboración, Proyecto, etc.">
                  <mat-icon matPrefix>badge</mat-icon>
                  <mat-hint>Este campo es opcional. Describe la relación o tipo de reconocimiento.</mat-hint>
                </mat-form-field>

                <div class="suggestions">
                  <p class="suggestions-title">Sugerencias:</p>
                  <div class="suggestion-chips">
                    <button 
                      mat-stroked-button 
                      type="button"
                      *ngFor="let suggestion of recognitionSuggestions"
                      (click)="selectSuggestion(suggestion)"
                      class="suggestion-chip">
                      {{ suggestion }}
                    </button>
                  </div>
                </div>
              </form>

              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Anterior
                </button>
                <button mat-raised-button color="primary" (click)="confirmarVinculacion()">
                  <mat-icon>person_add_alt</mat-icon>
                  Vincular Estudiante
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .vincular-estudiante-dialog {
      width: 100%;
      min-width: 650px;
      max-width: 750px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;

        .title-icon {
          font-size: 1.75rem;
          width: 1.75rem;
          height: 1.75rem;
        }
      }

      .close-button {
        color: white;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    .dialog-content {
      padding: 0 !important;
      min-height: 400px;

      ::ng-deep {
        .mat-stepper-horizontal {
          background: transparent;
        }

        .mat-horizontal-stepper-header-container {
          padding: 24px 24px 0;
          background: #f8f9fa;
        }

        .mat-step-header {
          .mat-step-icon {
            background-color: #667eea !important;
          }

          .mat-step-icon-selected {
            background-color: #764ba2 !important;
          }
        }
      }

      .step-content {
        padding: 24px;

        .step-description {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f0f4ff;
          border-radius: 8px;
          margin-bottom: 24px;
          border-left: 4px solid #667eea;

          mat-icon {
            font-size: 2rem;
            width: 2rem;
            height: 2rem;
            color: #667eea;
          }

          p {
            margin: 0;
            color: #555;
            font-size: 0.95rem;
          }
        }

        .search-prompt {
          display: flex;
          justify-content: center;
          padding: 48px 24px;

          .search-button {
            padding: 12px 32px;
            font-size: 1rem;

            mat-icon {
              margin-right: 8px;
            }
          }
        }

        .student-selected-card {
          margin-bottom: 24px;

          mat-card {
            border: 2px solid #667eea;
            border-radius: 12px;

            mat-card-header {
              img {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
              }

              mat-card-subtitle {
                .student-details {
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
                  margin-top: 8px;

                  span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.875rem;
                    color: #666;

                    mat-icon {
                      font-size: 1rem;
                      width: 1rem;
                      height: 1rem;
                      color: #667eea;
                    }
                  }
                }
              }
            }

            mat-card-actions {
              padding: 8px 16px;
              border-top: 1px solid #f0f0f0;
            }
          }
        }

        .recognition-form {
          .form-field {
            width: 100%;
            margin-bottom: 16px;
          }

          .suggestions {
            margin-top: 24px;

            .suggestions-title {
              font-size: 0.9rem;
              font-weight: 600;
              color: #666;
              margin-bottom: 12px;
            }

            .suggestion-chips {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;

              .suggestion-chip {
                font-size: 0.875rem;
                border-color: #667eea;
                color: #667eea;

                &:hover {
                  background: #f0f4ff;
                  border-color: #764ba2;
                  color: #764ba2;
                }
              }
            }
          }
        }

        .step-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e0e0e0;

          button {
            mat-icon {
              margin-right: 4px;
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .vincular-estudiante-dialog {
        min-width: unset;
        max-width: 100%;
        width: 100vw;
      }

      .dialog-header {
        padding: 16px;

        h2 {
          font-size: 1.2rem;

          .title-icon {
            font-size: 1.5rem;
            width: 1.5rem;
            height: 1.5rem;
          }
        }
      }

      .dialog-content {
        .step-content {
          padding: 16px;

          .suggestion-chips {
            .suggestion-chip {
              flex: 1 1 calc(50% - 4px);
              min-width: calc(50% - 4px);
            }
          }
        }
      }
    }
  `]
})
export class VincularEstudianteDialogComponent implements OnInit {
  selectedStudent = signal<StudentSearchResult | null>(null);
  recognitionForm!: FormGroup;
  
  recognitionSuggestions = [
    'Pasantía',
    'Colaboración',
    'Proyecto',
    'Beca',
    'Voluntariado',
    'Mentoría'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<VincularEstudianteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VincularEstudianteDialogData
  ) {}

  ngOnInit() {
    this.recognitionForm = this.formBuilder.group({
      recognitionType: ['']
    });
  }

  abrirBusquedaEstudiante() {
    const dialogRef = this.dialog.open(BuscarAlumnoDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: StudentSearchResult) => {
      if (result) {
        this.selectedStudent.set(result);
      }
    });
  }

  clearSelectedStudent() {
    this.selectedStudent.set(null);
  }

  selectSuggestion(suggestion: string) {
    this.recognitionForm.patchValue({
      recognitionType: suggestion
    });
  }

  confirmarVinculacion() {
    const student = this.selectedStudent();
    if (!student) {
      return;
    }

    const result: VincularEstudianteResult = {
      studentId: student.id,
      recognitionType: this.recognitionForm.value.recognitionType || undefined,
      studentInfo: student
    };

    this.dialogRef.close(result);
  }

  getDefaultAvatar(name: string, surname: string): string {
    const fullName = `${name} ${surname}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=667eea&color=fff&size=150`;
  }
}
