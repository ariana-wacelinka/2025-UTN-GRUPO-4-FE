import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

import { OfertasLaboralesService } from '../../services/ofertas-laborales.service';
import { AuthService } from '../../services/auth.service';
import { AtributosService } from '../../services/atributos.service';
import {
  CreateOfertaDTO,
  UpdateOfertaDTO,
  OfertaLaboralDTO,
  ModalidadTrabajo
} from '../../models/oferta-laboral.dto';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export interface OfertaFormDialogData {
  oferta?: OfertaLaboralDTO;
  isEditing: boolean;
}

@Component({
  selector: 'app-oferta-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="oferta-form-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon class="title-icon">{{ data.isEditing ? 'edit' : 'add' }}</mat-icon>
          {{ data.isEditing ? 'Editar Oferta Laboral' : 'Nueva Oferta Laboral' }}
        </h2>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="ofertaForm" class="oferta-form">
          
          <!-- Información Básica -->
          <div class="form-section">
            <h3 class="section-title">Información Básica</h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Título del Puesto </mat-label>
                <input matInput formControlName="title" placeholder="ej. Desarrollador Full Stack Senior">
                <mat-error *ngIf="f['title'].invalid && f['title'].touched">
                  <span *ngIf="f['title'].errors?.['required']">El título es requerido</span>
                  <span *ngIf="f['title'].errors?.['minlength']">Mínimo 5 caracteres</span>
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Modalidad de Trabajo </mat-label>
                <mat-select formControlName="modality">
                  @for (modalidad of modalidadesDisponibles; track modalidad.value) {
                    <mat-option [value]="modalidad.value">{{ modalidad.label }}</mat-option>
                  }
                </mat-select>
                <mat-error *ngIf="f['modality'].invalid && f['modality'].touched">
                  La modalidad es requerida
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Ubicación </mat-label>
                <input matInput formControlName="location" placeholder="ej. Buenos Aires, Argentina">
                <mat-error *ngIf="f['location'].invalid && f['location'].touched">
                  La ubicación es requerida
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <!-- Descripción -->
          <div class="form-section">
            <h3 class="section-title">Descripción del Puesto</h3>
            
            <mat-form-field appearance="outline" class="form-field full-width">
              <mat-label>Descripción </mat-label>
              <textarea 
                matInput 
                formControlName="description" 
                rows="4" 
                placeholder="Describe las responsabilidades, el ambiente de trabajo, y lo que hace único a este puesto..."
                maxlength="1000">
              </textarea>
              <mat-hint>{{ f['description'].value?.length || 0 }}/1000 - Mínimo 50 caracteres</mat-hint>
              <mat-error *ngIf="f['description'].invalid && f['description'].touched">
                <span *ngIf="f['description'].errors?.['required']">La descripción es requerida</span>
                <span *ngIf="f['description'].errors?.['minlength']">Mínimo 50 caracteres</span>
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Requisitos -->
          <div class="form-section">
            <h3 class="section-title">Requisitos y Habilidades</h3>
            
            <mat-form-field appearance="outline" class="form-field full-width">
              <mat-label>Requisitos </mat-label>
              <textarea 
                matInput 
                formControlName="requirements" 
                rows="4" 
                placeholder="Experiencia requerida, tecnologías, habilidades blandas, educación..."
                maxlength="800">
              </textarea>
              <mat-hint>{{ f['requirements'].value?.length || 0 }}/800 - Mínimo 20 caracteres</mat-hint>
              <mat-error *ngIf="f['requirements'].invalid && f['requirements'].touched">
                <span *ngIf="f['requirements'].errors?.['required']">Los requisitos son requeridos</span>
                <span *ngIf="f['requirements'].errors?.['minlength']">Mínimo 20 caracteres</span>
              </mat-error>
            </mat-form-field>

            <!-- Atributos con autocomplete -->
            <div class="skills-section">
              <label class="skills-label">Tecnologías y Habilidades Clave</label>
              <mat-form-field appearance="outline" class="skills-input">
                <mat-label>Atributos</mat-label>
                <input
                  matInput
                  [(ngModel)]="atributoInput"
                  name="atributoInput"
                  (input)="buscarAtributos($event)"
                  [matAutocomplete]="auto"
                  placeholder="Buscar o crear atributo..."
                />
                <mat-autocomplete
                  #auto="matAutocomplete"
                  (optionSelected)="seleccionarAtributo($event)"
                >
                  @for (atributo of atributosSugeridos$ | async; track atributo) {
                    <mat-option [value]="atributo">{{ atributo }}</mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>

              <mat-chip-set class="chips">
                @for (skill of skills(); track skill) {
                  <mat-chip (removed)="removeSkill(skill)" class="skill-chip">
                    {{ skill }}
                    <mat-icon matChipRemove>cancel</mat-icon>
                  </mat-chip>
                }
              </mat-chip-set>
              
              <div class="skills-hint">
                <mat-icon class="hint-icon">info</mat-icon>
                <span>Busca tecnologías existentes o crea nuevas escribiendo el nombre</span>
              </div>
            </div>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <div class="actions-content">
          <button mat-button mat-dialog-close class="cancel-button">
            Cancelar
          </button>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="onSubmit()" 
            [disabled]="isSubmitting() || ofertaForm.invalid"
            class="submit-button">
            <mat-icon *ngIf="isSubmitting()" class="loading-icon">refresh</mat-icon>
            <mat-icon *ngIf="!isSubmitting()">{{ data.isEditing ? 'save' : 'add' }}</mat-icon>
            {{ isSubmitting() ? 'Guardando...' : (data.isEditing ? 'Guardar Cambios' : 'Crear Oferta') }}
          </button>
        </div>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./oferta-form-dialog.component.scss']
})
export class OfertaFormDialogComponent implements OnInit {
  ofertaForm!: FormGroup;
  isSubmitting = signal(false);
  skills = signal<string[]>([]);
  atributoInput = '';
  atributosSugeridos$: Observable<string[]> = of([]);

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  modalidadesDisponibles = [
    { value: ModalidadTrabajo.PRESENCIAL, label: 'Presencial' },
    { value: ModalidadTrabajo.REMOTO, label: 'Remoto' },
    { value: ModalidadTrabajo.HIBRIDO, label: 'Híbrido' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OfertaFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OfertaFormDialogData,
    private ofertasLaboralesService: OfertasLaboralesService,
    private authService: AuthService,
    private atributosService: AtributosService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    if (this.data.isEditing && this.data.oferta) {
      this.validateEditPermissions();
    }
  }

  private validateEditPermissions() {
    const currentUserId = this.authService.keycloakUser?.id;
    const oferta = this.data.oferta!;
    
    if (!currentUserId || !this.ofertasLaboralesService.canEditOferta(oferta, currentUserId)) {
      this.snackBar.open('No tienes permisos para editar esta oferta', 'Cerrar', { duration: 5000 });
      this.dialogRef.close();
      return;
    }
    
    this.loadOfertaData();
  }

  private initializeForm() {
    this.ofertaForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
      requirements: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(800)]],
      modality: ['', [Validators.required]],
      location: ['', [Validators.required]],
      estimatedPayment: ['', [Validators.required, Validators.min(1)]],
      fechaVencimiento: ['', [this.futureDateValidator]]
    });
  }

  private loadOfertaData() {
    const oferta = this.data.oferta!;
    this.ofertaForm.patchValue({
      title: oferta.title,
      description: oferta.description,
      requirements: oferta.requirements,
      modality: oferta.modality,
      location: oferta.location,
      estimatedPayment: oferta.estimatedPayment,
      fechaVencimiento: oferta.fechaVencimiento
    });

    // Cargar atributos si existen
    if ((oferta as any).attributes && (oferta as any).attributes.length > 0) {
      this.skills.set((oferta as any).attributes);
    }
  }

  private futureDateValidator(control: any) {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate <= today ? { futureDate: true } : null;
  }

  // Gestión de atributos con autocomplete
  buscarAtributos(event: any): void {
    const query = event.target.value;
    if (query.length > 0) {
      this.atributosSugeridos$ = of(query).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => this.atributosService.buscarAtributos(q))
      );
    } else {
      this.atributosSugeridos$ = of([]);
    }
  }

  seleccionarAtributo(event: any): void {
    const atributoSeleccionado = event.option.value;

    if (atributoSeleccionado.startsWith('"') && atributoSeleccionado.endsWith('"')) {
      // Extraer el nombre del atributo de 'Crear "NombreAtributo"'
      const nombreAtributo = atributoSeleccionado.match(/"(.+)"/)?.[1] || '';
      this.atributosService.crearAtributo(nombreAtributo).subscribe(nuevoAtributo => {
        this.agregarAtributoALista(nuevoAtributo);
      });
    } else {
      this.agregarAtributoALista(atributoSeleccionado);
    }

    this.atributoInput = '';
  }

  private agregarAtributoALista(atributo: string): void {
    if (!this.skills().includes(atributo)) {
      this.skills.update(skills => [...skills, atributo]);
    }
  }

  // Gestión de skills/chips (mantener compatibilidad)
  addSkill(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value && !this.skills().includes(value)) {
      this.skills.update(skills => [...skills, value]);
    }

    event.chipInput!.clear();
  }

  removeSkill(skill: string): void {
    this.skills.update(skills => skills.filter(s => s !== skill));
  }

  showValidationSummary(): boolean {
    return this.ofertaForm.invalid && this.ofertaForm.touched;
  }

  onSubmit() {
    if (this.ofertaForm.valid) {
      this.isSubmitting.set(true);

      const formData = this.ofertaForm.value;
      const ofertaData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        modality: formData.modality,
        location: formData.location,
        estimatedPayment: Number(formData.estimatedPayment),
        fechaVencimiento: formData.fechaVencimiento || undefined,
        attributes: this.skills() // Incluir atributos en el formato de la API
      };

      if (this.data.isEditing && this.data.oferta) {
        // Actualizar oferta existente
        this.updateOferta(ofertaData as UpdateOfertaDTO);
      } else {
        // Crear nueva oferta
        this.createOferta(ofertaData as CreateOfertaDTO);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createOferta(ofertaData: CreateOfertaDTO) {
    this.ofertasLaboralesService.createOferta(ofertaData).subscribe({
      next: (nuevaOferta) => {
        this.isSubmitting.set(false);
        this.snackBar.open('Oferta creada exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(nuevaOferta);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error al crear oferta:', error);
        this.snackBar.open('Error al crear la oferta', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private updateOferta(ofertaData: UpdateOfertaDTO) {
    const ofertaId = this.data.oferta!.id;
    const currentUserId = this.authService.keycloakUser?.id;
    
    if (!currentUserId) {
      this.snackBar.open('Debes estar autenticado para editar ofertas', 'Cerrar', { duration: 3000 });
      this.isSubmitting.set(false);
      return;
    }

    // Validar permisos antes de actualizar
    this.ofertasLaboralesService.validateEditPermissions(ofertaId, currentUserId).subscribe({
      next: (canEdit) => {
        if (canEdit) {
          this.performUpdate(ofertaId, ofertaData);
        } else {
          this.isSubmitting.set(false);
          this.snackBar.open('No tienes permisos para editar esta oferta', 'Cerrar', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error al validar permisos:', error);
        this.snackBar.open(error.message || 'Error al validar permisos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private performUpdate(ofertaId: number, ofertaData: UpdateOfertaDTO) {
    this.ofertasLaboralesService.updateOferta(ofertaId, ofertaData).subscribe({
      next: (ofertaActualizada) => {
        this.isSubmitting.set(false);
        this.snackBar.open('Oferta actualizada exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(ofertaActualizada);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error al actualizar oferta:', error);
        const errorMessage = error.message || 'Error al actualizar la oferta';
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.ofertaForm.controls).forEach(key => {
      this.ofertaForm.get(key)?.markAsTouched();
    });
  }

  get f() {
    return this.ofertaForm.controls;
  }
}