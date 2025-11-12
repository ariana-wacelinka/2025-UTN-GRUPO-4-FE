import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { WorkExperienceDTO } from '../../models/aplicante.dto';

export interface WorkExperienceDialogData {
  experience?: WorkExperienceDTO;
  isEditing: boolean;
}

@Component({
  selector: 'app-work-experience-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>{{ data.isEditing ? 'edit' : 'add' }}</mat-icon>
          {{ data.isEditing ? 'Editar Experiencia Laboral' : 'Agregar Experiencia Laboral' }}
        </h2>
        <button mat-icon-button (click)="cerrar()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <form [formGroup]="experienceForm" class="experience-form">
          <!-- Cargo / Posición -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cargo / Posición</mat-label>
            <input matInput formControlName="position" placeholder="ej. Desarrollador Full Stack">
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error *ngIf="f['position'].hasError('required')">
              El cargo es requerido
            </mat-error>
            <mat-error *ngIf="f['position'].hasError('minlength')">
              El cargo debe tener al menos 3 caracteres
            </mat-error>
          </mat-form-field>

          <!-- Empresa -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Empresa / Organización</mat-label>
            <input matInput formControlName="company" placeholder="ej. TechCorp Solutions">
            <mat-icon matPrefix>business</mat-icon>
            <mat-error *ngIf="f['company'].hasError('required')">
              La empresa es requerida
            </mat-error>
            <mat-error *ngIf="f['company'].hasError('minlength')">
              La empresa debe tener al menos 2 caracteres
            </mat-error>
          </mat-form-field>

          <!-- Fechas -->
          <div class="date-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Fecha de Inicio</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate" type="date" placeholder="YYYY-MM-DD">
              <mat-icon matPrefix>event</mat-icon>
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
              <mat-hint>Formato: Año-Mes-Día (ej. 2024-01-15)</mat-hint>
              <mat-error *ngIf="f['startDate'].hasError('required')">
                La fecha de inicio es requerida
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width" *ngIf="!isCurrentJob">
              <mat-label>Fecha de Fin</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate" type="date" placeholder="YYYY-MM-DD">
              <mat-icon matPrefix>event</mat-icon>
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
              <mat-hint>Formato: Año-Mes-Día (ej. 2024-12-31)</mat-hint>
              <mat-error *ngIf="f['endDate'].hasError('invalidEndDate')">
                La fecha de fin debe ser posterior a la de inicio
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Checkbox Trabajo Actual -->
          <div class="checkbox-container">
            <mat-checkbox formControlName="isCurrentJob" (change)="onCurrentJobChange($event)">
              <mat-icon>schedule</mat-icon>
              Actualmente trabajo aquí
            </mat-checkbox>
          </div>

          <!-- Descripción -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descripción</mat-label>
            <textarea 
              matInput 
              formControlName="description" 
              rows="4"
              placeholder="Describe tus responsabilidades, logros y tecnologías utilizadas"></textarea>
            <mat-icon matPrefix>description</mat-icon>
            <mat-error *ngIf="f['description'].hasError('required')">
              La descripción es requerida
            </mat-error>
            <mat-error *ngIf="f['description'].hasError('minlength')">
              La descripción debe tener al menos 20 caracteres
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cerrar()" class="cancel-button">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="guardar()"
          [disabled]="!experienceForm.valid"
          class="save-button">
          <mat-icon>{{ data.isEditing ? 'save' : 'add' }}</mat-icon>
          {{ data.isEditing ? 'Guardar Cambios' : 'Agregar Experiencia' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      padding: 0;
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
        color: white;

        mat-icon {
          font-size: 1.75rem;
          width: 1.75rem;
          height: 1.75rem;
          color: white;
        }
      }

      .close-button {
        color: white;

        mat-icon {
          color: white;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    mat-dialog-content {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .experience-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: 48%;
    }

    .date-row {
      display: flex;
      gap: 4%;
      width: 100%;
    }

    .checkbox-container {
      margin: 8px 0;

      mat-checkbox {
        font-size: 14px;

        ::ng-deep .mdc-form-field {
          display: flex;
          align-items: center;
        }

        ::ng-deep .mdc-checkbox {
          display: flex;
          align-items: center;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #667eea;
          margin-left: 4px;
          vertical-align: middle;
          line-height: 1;
        }
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      gap: 12px;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        padding: 0 24px;
        height: 40px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .cancel-button {
        color: #666 !important;

        mat-icon {
          color: #666 !important;
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
      }

      .save-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        &:hover:not([disabled]) {
          background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        &:disabled {
          background: #ccc;
          color: #666;
        }
      }
    }

    // Form field customization
    mat-form-field {
      mat-icon[matPrefix] {
        margin-right: 12px;
        color: #667eea;
      }
    }

    // Responsive
    @media (max-width: 768px) {
      .date-row {
        flex-direction: column;
        gap: 20px;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class WorkExperienceDialogComponent implements OnInit {
  experienceForm!: FormGroup;
  isCurrentJob = false;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<WorkExperienceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkExperienceDialogData
  ) {}

  ngOnInit() {
    this.initializeForm();
    if (this.data.experience) {
      this.loadExperienceData();
    }
  }

  private initializeForm() {
    this.experienceForm = this.formBuilder.group({
      company: ['', [Validators.required, Validators.minLength(2)]],
      position: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      isCurrentJob: [false]
    });

    // Validación personalizada para endDate
    this.experienceForm.get('endDate')?.setValidators([
      (control) => {
        const startDate = this.experienceForm?.get('startDate')?.value;
        const endDate = control.value;
        const isCurrentJob = this.experienceForm?.get('isCurrentJob')?.value;

        if (!isCurrentJob && endDate && startDate && endDate <= startDate) {
          return { invalidEndDate: true };
        }
        return null;
      }
    ]);

    // Actualizar validación cuando cambie startDate
    this.experienceForm.get('startDate')?.valueChanges.subscribe(() => {
      this.experienceForm.get('endDate')?.updateValueAndValidity();
    });
  }

  private loadExperienceData() {
    const exp = this.data.experience!;
    this.isCurrentJob = exp.isCurrentJob || false;

    this.experienceForm.patchValue({
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.endDate || '',
      description: exp.description,
      isCurrentJob: exp.isCurrentJob || false
    });
  }

  onCurrentJobChange(event: any) {
    this.isCurrentJob = event.checked;
    if (this.isCurrentJob) {
      this.experienceForm.get('endDate')?.setValue('');
      this.experienceForm.get('endDate')?.clearValidators();
    } else {
      this.experienceForm.get('endDate')?.setValidators([Validators.required]);
    }
    this.experienceForm.get('endDate')?.updateValueAndValidity();
  }

  cerrar() {
    this.dialogRef.close();
  }

  guardar() {
    if (this.experienceForm.valid) {
      const formValue = this.experienceForm.value;
      const result = {
        ...formValue,
        endDate: formValue.isCurrentJob ? undefined : formValue.endDate
      };
      this.dialogRef.close(result);
    }
  }

  get f() {
    return this.experienceForm.controls;
  }
}
