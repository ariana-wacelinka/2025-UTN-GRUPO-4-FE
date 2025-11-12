import { Component, Inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { CreatePersonalProjectDTO, UpdatePersonalProjectDTO, PersonalProjectDTO } from '../../models/aplicante.dto';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

export interface PersonalProjectDialogData {
  project?: PersonalProjectDTO;
  isEditing: boolean;
}

@Component({
  selector: 'app-personal-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatChipsModule
  ],
  templateUrl: './personal-project-dialog.component.html',
  styleUrl: './personal-project-dialog.component.scss'
})
export class PersonalProjectDialogComponent implements OnInit {
  projectForm!: FormGroup;
  isEditing = signal(false);
  
  technologies = signal<string[]>([]);
  technologyInput = '';
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PersonalProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PersonalProjectDialogData
  ) {
    this.isEditing.set(data.isEditing);
  }

  ngOnInit(): void {
    this.initializeForm();
    
    if (this.data.project) {
      this.loadProjectData(this.data.project);
    }
  }

  private initializeForm(): void {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      projectUrl: ['', [this.urlValidator]],
      imageUrl: ['', [this.urlValidator]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      isCurrentProject: [false]
    });

    // Deshabilitar endDate si es proyecto actual
    this.projectForm.get('isCurrentProject')?.valueChanges.subscribe(isCurrent => {
      const endDateControl = this.projectForm.get('endDate');
      if (isCurrent) {
        endDateControl?.setValue(null);
        endDateControl?.disable();
      } else {
        endDateControl?.enable();
      }
    });
  }

  private loadProjectData(project: PersonalProjectDTO): void {
    this.projectForm.patchValue({
      title: project.title,
      description: project.description,
      projectUrl: project.projectUrl || '',
      imageUrl: project.imageUrl || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      isCurrentProject: !project.endDate
    });

    if (project.technologies && project.technologies.length > 0) {
      this.technologies.set([...project.technologies]);
    }
  }

  private urlValidator(control: any) {
    if (!control.value) return null;
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(control.value) ? null : { invalidUrl: true };
  }

  addTechnology(event: any): void {
    const value = (event.value || '').trim();
    
    if (value && !this.technologies().includes(value)) {
      this.technologies.update(techs => [...techs, value]);
    }

    event.chipInput?.clear();
  }

  removeTechnology(technology: string): void {
    this.technologies.update(techs => techs.filter(t => t !== technology));
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.projectForm.invalid || this.technologies().length === 0) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const formValue = this.projectForm.getRawValue();
    
    if (this.isEditing()) {
      const updateData: Partial<UpdatePersonalProjectDTO> = {
        title: formValue.title,
        description: formValue.description,
        technologies: this.technologies(),
        projectUrl: formValue.projectUrl || undefined,
        imageUrl: formValue.imageUrl || undefined,
        startDate: this.formatDate(formValue.startDate),
        endDate: formValue.isCurrentProject ? undefined : this.formatDate(formValue.endDate)
      };
      this.dialogRef.close(updateData);
    } else {
      const createData: Omit<CreatePersonalProjectDTO, 'studentId'> = {
        title: formValue.title,
        description: formValue.description,
        technologies: this.technologies(),
        projectUrl: formValue.projectUrl || undefined,
        imageUrl: formValue.imageUrl || undefined,
        startDate: this.formatDate(formValue.startDate),
        endDate: formValue.isCurrentProject ? undefined : this.formatDate(formValue.endDate)
      };
      this.dialogRef.close(createData);
    }
  }

  private formatDate(date: any): string | undefined {
    if (!date) return undefined;
    
    if (typeof date === 'string') return date;
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get f() {
    return this.projectForm.controls;
  }
}
