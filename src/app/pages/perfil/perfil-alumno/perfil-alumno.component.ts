import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { PerfilAlumnoService, MateriasState } from '../../../services/perfil-alumno.service';
import { EstudianteDTO, ActualizarEstudianteDTO } from '../../../models/aplicante.dto';
import { IdiomaDTO } from '../../../models/usuario.dto';
import { Subject, takeUntil } from 'rxjs';

// Importar componentes compartidos
import { ProfileHeaderComponent, ProfileHeaderData, SocialLink } from '../../../components/profile-header/profile-header.component';
import { InfoCardComponent, InfoCardData } from '../../../components/info-card/info-card.component';
import { SkillsCardComponent } from '../../../components/skills-card/skills-card.component';

@Component({
  selector: 'app-perfil-alumno',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    // Componentes compartidos
    ProfileHeaderComponent,
    InfoCardComponent,
    SkillsCardComponent
  ],
  templateUrl: './perfil-alumno.component.html',
  styleUrl: './perfil-alumno.component.scss'
})
export class PerfilAlumnoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals
  perfilAlumno = signal<EstudianteDTO | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);
  selectedImageFile = signal<File | null>(null);
  selectedCVFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // Materias - Nueva funcionalidad
  materiasAlumno: any[] = [];
  promedioMaterias = 0;
  totalMaterias = 0;
  isMateriasLoading = false;
  isMateriasUploading = false;
  materiasError: string | null = null;
  selectedMateriasFileName: string | null = null;
  private readonly MAX_MATERIAS_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Form
  editForm!: FormGroup;

  // Opciones estáticas
  nivelesIdioma = ['1', '2', '3', '4', '5']; // Cambio a números según el DTO
  habilidadesDisponibles = [
    'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue.js', 'Node.js',
    'Python', 'Java', 'C#', 'PHP', 'MySQL', 'PostgreSQL', 'MongoDB',
    'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'HTML', 'CSS',
    'SCSS', 'Bootstrap', 'Tailwind CSS', 'Express.js', 'Spring Boot',
    'Django', 'Flask', 'Laravel', '.NET', 'REST APIs', 'GraphQL'
  ];

  // Computed properties para componentes compartidos
  profileHeaderData = computed((): ProfileHeaderData | null => {
    const perfil = this.perfilAlumno();
    if (!perfil) return null;

    return {
      name: `${perfil.name} ${perfil.surname}`,
      subtitle: `${perfil.career} - ${perfil.currentYearLevel}º año`,
      description: perfil.institution,
      imageUrl: perfil.imageUrl,
      showDownloadCV: true
    };
  });

  socialLinksCompact = computed((): SocialLink[] => {
    const perfil = this.perfilAlumno();
    if (!perfil) return [];

    const links: SocialLink[] = [];
    if (perfil.linkedinUrl) {
      links.push({
        icon: 'work',
        label: 'LinkedIn',
        url: perfil.linkedinUrl
      });
    }
    if (perfil.githubUrl) {
      links.push({
        icon: 'code',
        label: 'GitHub',
        url: perfil.githubUrl
      });
    }
    return links;
  });

  personalInfoData = computed((): InfoCardData | null => {
    const perfil = this.perfilAlumno();
    if (!perfil) return null;

    const items = [];
    if (perfil.email) items.push({ icon: 'email', label: 'Email', value: perfil.email });
    if (perfil.phone) items.push({ icon: 'phone', label: 'Teléfono', value: perfil.phone });
    if (perfil.location) items.push({ icon: 'location_on', label: 'Ubicación', value: perfil.location });
    if (perfil.dateOfBirth) items.push({ icon: 'cake', label: 'Fecha de Nacimiento', value: perfil.dateOfBirth });

    return {
      title: 'Información Personal',
      icon: 'person',
      items
    };
  });

  professionalLinksData = computed((): SocialLink[] => {
    const perfil = this.perfilAlumno();
    if (!perfil) return [];

    const links: SocialLink[] = [];
    if (perfil.linkedinUrl) {
      links.push({
        icon: 'work',
        label: 'LinkedIn',
        url: perfil.linkedinUrl
      });
    }
    if (perfil.githubUrl) {
      links.push({
        icon: 'code',
        label: 'GitHub',
        url: perfil.githubUrl
      });
    }
    if (perfil.cvUrl) {
      links.push({
        icon: 'description',
        label: 'Curriculum Vitae',
        url: perfil.cvUrl
      });
    }
    return links;
  });

  constructor(
    private formBuilder: FormBuilder,
    private perfilService: PerfilAlumnoService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.editForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      location: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      career: ['', [Validators.required]],
      currentYearLevel: ['', [Validators.required]],
      institution: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      linkedinUrl: [''],
      githubUrl: [''],
      skills: this.formBuilder.array([]),
      languages: this.formBuilder.array([])
    });
  }

  ngOnInit() {
    this.cargarPerfil();
    this.suscribirseAMaterias();
    this.obtenerMateriasDesdeBackend();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarPerfil() {
    this.isLoading.set(true);

    // Verificar si hay un userId en los query params (viene de ver aplicantes)
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];

      if (userId) {
        // TODO Sprint 2: Reemplazar con llamada al backend
        this.perfilAlumno.set(this.getMockPerfilByUserId(Number(userId)));
        this.isLoading.set(false);
      } else {
        // Cargar perfil del usuario actual
        this.perfilService.getPerfil()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (perfil) => {
              this.perfilAlumno.set(perfil);
              this.isLoading.set(false);
            },
            error: (error) => {
              console.error('Error al cargar el perfil:', error);
              this.isLoading.set(false);
            }
          });
      }
    });
  }

  /**
   * Mock de perfiles de aplicantes - actualizado con nuevos DTOs
   * TODO Sprint 2: Eliminar y usar servicio real con backend
   */
  private getMockPerfilByUserId(userId: number): EstudianteDTO {
    const mockPerfiles: { [key: number]: EstudianteDTO } = {
      101: {
        id: 1,
        description: 'Estudiante apasionada por el desarrollo full-stack y las metodologías ágiles.',
        phone: '+54 9 11 2345-6789',
        email: 'wacelinka@example.com',
        location: 'La Plata, Buenos Aires',
        name: 'Ariana',
        surname: 'Wacelinka',
        imageUrl: 'https://i.pravatar.cc/300?img=47',
        linkedinUrl: 'https://linkedin.com/in/ariana-wacelinka',
        role: 'estudiante',
        githubUrl: 'https://github.com/ariana-wacelinka',
        career: 'Ingeniería en Sistemas de Información',
        currentYearLevel: 3,
        institution: 'UTN FRLP',
        skills: ['Angular', 'TypeScript', 'Node.js', 'MongoDB', 'Git', 'Scrum'],
        cvUrl: '/assets/documents/WACELINKA, Ariana.pdf',
        cvFileName: 'WACELINKA_Ariana.pdf',
        incomeDate: '2022-03-01',
        dateOfBirth: '2002-03-15',
        coverLetter: 'Estudiante apasionada por el desarrollo full-stack.',
        languages: [
          { id: 1, name: 'Español', level: 5 },
          { id: 2, name: 'Inglés', level: 4 }
        ]
      }
      // ... otros perfiles mock pueden agregarse aquí
    };

    return mockPerfiles[userId] || mockPerfiles[101];
  }

  // Métodos de eventos de componentes compartidos
  onEditProfile() {
    const perfil = this.perfilAlumno();
    if (!perfil) return;

    this.isEditing.set(true);
    this.imagePreview.set(perfil.imageUrl);

    this.editForm.patchValue({
      name: perfil.name,
      surname: perfil.surname,
      email: perfil.email,
      phone: perfil.phone,
      location: perfil.location,
      dateOfBirth: perfil.dateOfBirth,
      career: perfil.career,
      currentYearLevel: perfil.currentYearLevel,
      institution: perfil.institution,
      description: perfil.description,
      linkedinUrl: perfil.linkedinUrl,
      githubUrl: perfil.githubUrl
    });

    this.setSkills(perfil.skills);
    this.setLanguages(perfil.languages);
  }

  onCancelEdit() {
    this.isEditing.set(false);
    this.selectedImageFile.set(null);
    this.selectedCVFile.set(null);
    this.imagePreview.set(null);
  }

  onImageSelected(file: File) {
    this.selectedImageFile.set(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  onDownloadCV() {
    try {
      this.perfilService.descargarCV();
    } catch (error) {
      console.error('Error al descargar CV:', error);
    }
  }

  onSaveChanges() {
    if (this.editForm.valid && this.perfilAlumno()) {
      this.isLoading.set(true);

      const datosActualizados: ActualizarEstudianteDTO = {
        ...this.editForm.value,
        skills: this.skills.value,
        languages: this.languages.value
      };

      this.perfilService.actualizarPerfil(datosActualizados)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (perfilActualizado) => {
            this.isEditing.set(false);
            this.isLoading.set(false);
            this.selectedImageFile.set(null);
            this.selectedCVFile.set(null);

            this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error al actualizar el perfil:', error);
            this.isLoading.set(false);
            this.snackBar.open('Error al actualizar el perfil', 'Cerrar', {
              duration: 3000
            });
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Métodos auxiliares del formulario
  get f() {
    return this.editForm.controls;
  }

  get skills(): FormArray {
    return this.editForm.get('skills') as FormArray;
  }

  get languages(): FormArray {
    return this.editForm.get('languages') as FormArray;
  }

  // Métodos de compatibilidad con el template existente
  get habilidades(): FormArray {
    return this.skills;
  }

  get idiomas(): FormArray {
    return this.languages;
  }

  agregarHabilidad() {
    this.addSkill();
  }

  eliminarHabilidad(index: number) {
    this.removeSkill(index);
  }

  agregarIdioma() {
    this.addLanguage();
  }

  eliminarIdioma(index: number) {
    this.removeLanguage(index);
  }

  abrirEnlace(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  descargarCV() {
    this.onDownloadCV();
  }

  private setSkills(skills: string[]) {
    const skillsArray = this.editForm.get('skills') as FormArray;
    skillsArray.clear();
    skills.forEach(skill => {
      skillsArray.push(this.formBuilder.control(skill, Validators.required));
    });
  }

  addSkill() {
    this.skills.push(this.formBuilder.control('', Validators.required));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  private setLanguages(languages: IdiomaDTO[]) {
    const languagesArray = this.editForm.get('languages') as FormArray;
    languagesArray.clear();
    languages.forEach(language => {
      languagesArray.push(this.formBuilder.group({
        name: [language.name, Validators.required],
        level: [language.level, Validators.required]
      }));
    });
  }

  addLanguage() {
    const languageGroup = this.formBuilder.group({
      name: ['', Validators.required],
      level: ['', Validators.required]
    });
    this.languages.push(languageGroup);
  }

  removeLanguage(index: number) {
    this.languages.removeAt(index);
  }

  onCVSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedCVFile.set(file);
      this.snackBar.open('CV seleccionado correctamente', 'Cerrar', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Por favor selecciona un archivo PDF válido', 'Cerrar', {
        duration: 3000
      });
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.editForm.controls).forEach(key => {
      this.editForm.get(key)?.markAsTouched();
    });

    this.skills.controls.forEach(control => control.markAsTouched());
    this.languages.controls.forEach(group => {
      Object.keys((group as FormGroup).controls).forEach(key => {
        (group as FormGroup).get(key)?.markAsTouched();
      });
    });
  }

  // ============= MÉTODOS DE MATERIAS =============

  private suscribirseAMaterias() {
    this.perfilService.obtenerMateriasState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: MateriasState) => {
        this.materiasAlumno = state.materias;
        this.promedioMaterias = state.promedioGeneral;
        this.totalMaterias = state.totalMaterias;
      });
  }

  private obtenerMateriasDesdeBackend() {
    this.isMateriasLoading = true;

    this.perfilService.cargarMateriasDesdeBackend()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isMateriasLoading = false;
          this.materiasError = null;
        },
        error: (error) => {
          console.error('Error al cargar materias:', error);
          this.isMateriasLoading = false;
          this.materiasError = 'No pudimos cargar tus materias. Intenta nuevamente más tarde.';
        }
      });
  }

  onMateriasFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;

    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xls') {
      this.selectedMateriasFileName = null;
      this.snackBar.open('El archivo debe estar en formato .xls (Alumnos Web).', 'Cerrar', {
        duration: 4000
      });
      input.value = '';
      return;
    }

    if (file.size > this.MAX_MATERIAS_FILE_SIZE) {
      this.selectedMateriasFileName = null;
      this.snackBar.open('El archivo supera el tamaño máximo permitido (5 MB).', 'Cerrar', {
        duration: 4000
      });
      input.value = '';
      return;
    }

    this.selectedMateriasFileName = file.name;
    this.materiasError = null;
    this.subirMateriasExcel(file);
    input.value = '';
  }

  private subirMateriasExcel(archivo: File) {
    if (this.isMateriasUploading) {
      return;
    }

    this.isMateriasUploading = true;

    this.perfilService.subirMateriasExcel(archivo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isMateriasUploading = false;
          this.snackBar.open('Materias actualizadas correctamente.', 'Cerrar', {
            duration: 3000
          });
          this.selectedMateriasFileName = null;
          this.materiasError = null;
        },
        error: (error) => {
          console.error('Error al subir materias:', error);
          this.snackBar.open('No pudimos procesar el archivo. Intenta nuevamente.', 'Cerrar', {
            duration: 4000
          });
          this.isMateriasUploading = false;
          this.selectedMateriasFileName = null;
        },
        complete: () => {
          this.isMateriasUploading = false;
        }
      });
  }

  trackByMateria(index: number, materia: any) {
    return materia.codigo || materia.nombre;
  }
}