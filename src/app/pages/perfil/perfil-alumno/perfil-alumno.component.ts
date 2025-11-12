import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { PerfilAlumnoService, MateriasState, PagedOfertasAplicadasResponse, OfertaAplicada, ApplicationStatus, OfferDetails } from '../../../services/perfil-alumno.service';
import { AuthService } from '../../../services/auth.service';
import { AtributosService } from '../../../services/atributos.service';
import { offersService } from '../../../services/ofertas.service';
import { OfertaListaDTO, PagedResponseDTO } from '../../../models/oferta.dto';
import { EstudianteDTO, ActualizarEstudianteDTO, AssociatedCompanyDTO, WorkExperienceDTO, PersonalProjectDTO, CreateWorkExperienceDTO, UpdateWorkExperienceDTO, CreatePersonalProjectDTO, UpdatePersonalProjectDTO } from '../../../models/aplicante.dto';
import { IdiomaDTO } from '../../../models/usuario.dto';
import { Subject, takeUntil, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ProfileHeaderComponent, ProfileHeaderData, SocialLink } from '../../../components/profile-header/profile-header.component';
import { InfoCardComponent, InfoCardData } from '../../../components/info-card/info-card.component';
import { SkillsCardComponent } from '../../../components/skills-card/skills-card.component';
import { WorkExperienceDialogComponent, WorkExperienceDialogData } from '../../../components/work-experience-dialog/work-experience-dialog.component';
import { PersonalProjectDialogComponent, PersonalProjectDialogData } from '../../../components/personal-project-dialog/personal-project-dialog.component';

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
    MatTooltipModule,
    MatAutocompleteModule,
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
  isCVUploadPending = signal(false);
  isUploadingCV = signal(false);

  hasCVUploaded = computed(() => {
    const perfil = this.perfilAlumno();
    return perfil?.cvUrl ? true : false;
  });

  materiasAlumno = computed(() => this.perfilAlumno()?.subjects || []);
  promedioMaterias = computed(() => {
    const materias = this.materiasAlumno();
    if (!materias.length) return 0;
    const suma = materias.reduce((acc, m) => acc + m.note, 0);
    return suma / materias.length;
  });
  totalMaterias = computed(() => this.materiasAlumno().length);
  isMateriasUploading = false;
  materiasError: string | null = null;
  selectedMateriasFileName: string | null = null;
  private readonly MAX_MATERIAS_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  ofertasAplicadas: OfertaAplicada[] = [];
  isOfertasLoading = false;
  ofertasError: string | null = null;
  totalOfertasAplicadas = 0;

  // Ofertas Publicadas por el alumno
  ofertasPublicadas: any[] = [];
  isOfertasPublicadasLoading = false;
  ofertasPublicadasError: string | null = null;
  totalOfertasPublicadas = 0;

  // Form
  editForm!: FormGroup;

  // Atributos con autocomplete - Similar a oferta-form-dialog
  skillsSignal = signal<string[]>([]);
  skillInput = '';
  skillsSugeridas$: Observable<string[]> = of([]);

  // Opciones estáticas
  nivelesIdioma = ['1', '2', '3', '4', '5']; // Cambio a números según el DTO

  // Computed properties para componentes compartidos
  profileHeaderData = computed((): ProfileHeaderData | null => {
    const perfil = this.perfilAlumno();
    if (!perfil) return null;

    // Siempre usar la información del perfil que se está viendo, no del usuario actual
    const displayName = `${perfil.name} ${perfil.surname}`;
    const imageUrl = perfil.imageUrl;

    return {
      name: displayName,
      subtitle: perfil.career && perfil.currentYearLevel ? `${perfil.career} - ${perfil.currentYearLevel}º año` : '',
      description: perfil.institution,
      imageUrl: imageUrl,
      showDownloadCV: true,
      hasCVAvailable: !!perfil.cvUrl
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

  associatedCompanies = computed(() => {
    return this.perfilAlumno()?.associatedCompanies || [];
  });

  hasAssociatedCompanies = computed(() => {
    return this.associatedCompanies().length > 0;
  });

  workExperience = computed(() => {
    return this.perfilAlumno()?.workExperience || [];
  });

  hasWorkExperience = computed(() => {
    return this.workExperience().length > 0;
  });

  personalProjects = computed(() => {
    return this.perfilAlumno()?.personalProjects || [];
  });

  hasPersonalProjects = computed(() => {
    return this.personalProjects().length > 0;
  });

  constructor(
    private formBuilder: FormBuilder,
    private perfilService: PerfilAlumnoService,
    private authService: AuthService,
    private atributosService: AtributosService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private ofertasService: offersService,
    private dialog: MatDialog
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    const urlValidator = (control: any) => {
      if (!control.value) return null; 
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(control.value) ? null : { invalidUrl: true };
    };

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
      imageUrl: [''],
      linkedinUrl: ['', [urlValidator]],
      githubUrl: ['', [urlValidator]],
      languages: this.formBuilder.array([])
    });
  }

  ngOnInit() {
    this.cargarPerfil();
    this.cargarOfertasAplicadas();
    // cargarOfertasPublicadas() se llamará después de cargar el perfil
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarPerfil() {
    this.isLoading.set(true);

    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          let userId = params['id'];

          if (!userId) {
            userId = this.route.snapshot.queryParams['userId'];
          }

          return this.perfilService.getPerfil(userId);
        })
      )
      .subscribe({
        next: (perfil) => {
          console.log('Perfil cargado desde servicio:', perfil);
          
          // mockeado temporal. borrar cuando el backend implemente estos campos
          if (!perfil.associatedCompanies || perfil.associatedCompanies.length === 0) {
            perfil.associatedCompanies = [
              {
                id: 1,
                companyId: 1,
                companyName: 'TechCorp Solutions',
                companyImageUrl: 'https://ui-avatars.com/api/?name=TechCorp&background=667eea&color=fff',
                companyIndustry: 'Tecnología',
                associationDate: '2024-06-15',
                recognitionType: 'Pasantía'
              },
              {
                id: 2,
                companyId: 2,
                companyName: 'Innovate Labs',
                companyImageUrl: 'https://ui-avatars.com/api/?name=Innovate&background=764ba2&color=fff',
                companyIndustry: 'Desarrollo de Software',
                associationDate: '2024-03-20',
                recognitionType: 'Colaboración'
              }
            ];
          }
          
          if (!perfil.workExperience || perfil.workExperience.length === 0) {
            perfil.workExperience = [
              {
                id: 1,
                company: 'TechCorp Solutions',
                position: 'Desarrollador Frontend Junior',
                startDate: '2024-06',
                endDate: undefined,
                description: 'Desarrollo de interfaces de usuario con Angular y TypeScript. Colaboración en equipo usando metodologías ágiles.',
                isCurrentJob: true
              },
              {
                id: 2,
                company: 'Freelance',
                position: 'Desarrollador Web',
                startDate: '2023-03',
                endDate: '2024-05',
                description: 'Desarrollo de sitios web para pequeñas empresas utilizando tecnologías modernas.',
                isCurrentJob: false
              }
            ];
          }
          
          if (!perfil.personalProjects || perfil.personalProjects.length === 0) {
            perfil.personalProjects = [
              {
                id: 1,
                title: 'Sistema de Gestión de Empleos',
                description: 'Plataforma web para conectar estudiantes con oportunidades laborales. Desarrollada con Angular y Spring Boot.',
                technologies: ['Angular', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Material Design'],
                projectUrl: 'https://github.com/usuario/job-platform',
                startDate: '2024-01',
                endDate: '2024-11'
              },
              {
                id: 2,
                title: 'App de Recetas',
                description: 'Aplicación móvil para descubrir y compartir recetas de cocina. Incluye búsqueda avanzada y favoritos.',
                technologies: ['React Native', 'Node.js', 'MongoDB', 'Express'],
                projectUrl: 'https://github.com/usuario/recipe-app',
                startDate: '2023-08',
                endDate: '2023-12'
              }
            ];
          }
          
          console.log('Empresas asociadas:', perfil.associatedCompanies);
          console.log('Experiencia laboral:', perfil.workExperience);
          console.log('Proyectos personales:', perfil.personalProjects);
          
          this.perfilAlumno.set(perfil);
          this.materiasAlumno
          this.isLoading.set(false);
          
          // Cargar ofertas publicadas después de tener el perfil cargado
          this.cargarOfertasPublicadas();
        },
        error: (error) => {
          console.error('Error al cargar el perfil:', error);
          this.isLoading.set(false);
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
        ],
        subjects: [],
        associatedCompanies: [
          {
            id: 1,
            companyId: 1,
            companyName: 'TechCorp Solutions',
            companyImageUrl: 'https://ui-avatars.com/api/?name=TechCorp&background=667eea&color=fff',
            companyIndustry: 'Tecnología',
            associationDate: '2024-06-15',
            recognitionType: 'Pasantía'
          },
          {
            id: 2,
            companyId: 2,
            companyName: 'Innovate Labs',
            companyImageUrl: 'https://ui-avatars.com/api/?name=Innovate&background=764ba2&color=fff',
            companyIndustry: 'Desarrollo de Software',
            associationDate: '2024-03-20',
            recognitionType: 'Colaboración'
          }
        ],
        workExperience: [
          {
            id: 1,
            company: 'TechCorp Solutions',
            position: 'Desarrolladora Frontend Junior',
            startDate: '2024-06',
            endDate: undefined,
            description: 'Desarrollo de interfaces de usuario con Angular y TypeScript. Colaboración en equipo usando metodologías ágiles.',
            isCurrentJob: true
          },
          {
            id: 2,
            company: 'Freelance',
            position: 'Desarrolladora Web',
            startDate: '2023-03',
            endDate: '2024-05',
            description: 'Desarrollo de sitios web para pequeñas empresas utilizando tecnologías modernas.',
            isCurrentJob: false
          }
        ],
        personalProjects: [
          {
            id: 1,
            title: 'Sistema de Gestión de Empleos',
            description: 'Plataforma web para conectar estudiantes con oportunidades laborales. Desarrollada con Angular y Spring Boot.',
            technologies: ['Angular', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Material Design'],
            projectUrl: 'https://github.com/ariana-wacelinka/job-platform',
            startDate: '2024-01',
            endDate: '2024-11'
          },
          {
            id: 2,
            title: 'App de Recetas',
            description: 'Aplicación móvil para descubrir y compartir recetas de cocina. Incluye búsqueda avanzada y favoritos.',
            technologies: ['React Native', 'Node.js', 'MongoDB', 'Express'],
            projectUrl: 'https://github.com/ariana-wacelinka/recipe-app',
            startDate: '2023-08',
            endDate: '2023-12'
          }
        ]
      }
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
      imageUrl: perfil.imageUrl || '',
      linkedinUrl: perfil.linkedinUrl,
      githubUrl: perfil.githubUrl
    });

    // Cargar skills en el signal
    this.skillsSignal.set([...perfil.skills]);
    this.setLanguages(perfil.languages);
  }

  onCancelEdit() {
    this.isEditing.set(false);
    this.selectedImageFile.set(null);
    this.selectedCVFile.set(null);
    this.imagePreview.set(null);
    this.isCVUploadPending.set(false);
    this.isUploadingCV.set(false);
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
        skills: this.skillsSignal(),
        languages: this.languages.value
      };
      const selectedImage = this.selectedImageFile();
      if (selectedImage) {
        this.perfilService.subirImagenPerfil(selectedImage)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (perfilConImagen) => {
              this.perfilAlumno.set(perfilConImagen);
              this.imagePreview.set(perfilConImagen.imageUrl || null);
              this.editForm.patchValue({ imageUrl: perfilConImagen.imageUrl || '' });

              this.finishProfileUpdate(datosActualizados);
            },
            error: (error) => {
              console.error('Error al subir la imagen:', error);
              this.isLoading.set(false);
              this.snackBar.open('Error al subir la imagen de perfil. Intenta nuevamente.', 'Cerrar', { duration: 3000 });
            }
          });
      } else {
        this.finishProfileUpdate(datosActualizados);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private finishProfileUpdate(datosActualizados: ActualizarEstudianteDTO) {
    this.perfilService.actualizarPerfil(datosActualizados)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (perfilActualizado) => {
          this.isEditing.set(false);
          this.selectedImageFile.set(null);
          this.selectedCVFile.set(null);
          this.imagePreview.set(null);
          this.isCVUploadPending.set(false);
          this.isUploadingCV.set(false);

          this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
            duration: 3000
          });

          this.cargarPerfil();
        },
        error: (error) => {
          console.error('Error al actualizar el perfil:', error);
          this.isLoading.set(false);
          this.snackBar.open('Error al actualizar el perfil', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  // Métodos auxiliares del formulario
  get f() {
    return this.editForm.controls;
  }

  get languages(): FormArray {
    return this.editForm.get('languages') as FormArray;
  }

  // Métodos de compatibilidad con el template existente
  get idiomas(): FormArray {
    return this.languages;
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

  // Métodos para gestión de habilidades con autocomplete (similar a oferta-form-dialog)
  buscarHabilidades(event: any): void {
    const query = event.target.value;
    if (query.length > 0) {
      this.skillsSugeridas$ = of(query).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => this.atributosService.buscarAtributos(q))
      );
    } else {
      this.skillsSugeridas$ = of([]);
    }
  }

  seleccionarHabilidad(event: any): void {
    const habilidadSeleccionada = event.option.value;

    if (habilidadSeleccionada.startsWith('"') && habilidadSeleccionada.endsWith('"')) {
      const nombreHabilidad = habilidadSeleccionada.match(/"(.+)"/)?.[1] || '';
      this.atributosService.crearAtributo(nombreHabilidad).subscribe(nuevaHabilidad => {
        this.agregarHabilidadALista(nuevaHabilidad);
      });
    } else {
      this.agregarHabilidadALista(habilidadSeleccionada);
    }

    this.skillInput = '';
  }

  private agregarHabilidadALista(habilidad: string): void {
    if (!this.skillsSignal().includes(habilidad)) {
      this.skillsSignal.update(skills => [...skills, habilidad]);
    }
  }

  removeSkill(skill: string): void {
    this.skillsSignal.update(skills => skills.filter(s => s !== skill));
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
      this.isCVUploadPending.set(true);
    } else {
      this.snackBar.open('Por favor selecciona un archivo PDF válido', 'Cerrar', {
        duration: 3000
      });
    }
  }

  onConfirmCVUpload() {
    const file = this.selectedCVFile();
    if (!file) return;

    this.isUploadingCV.set(true);
    this.isCVUploadPending.set(false);

    this.perfilService.subirCV(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isUploadingCV.set(false);
          this.selectedCVFile.set(null);
          this.snackBar.open('CV subido exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.perfilAlumno.update(perfil => {
            if (!perfil) return null;
            return { ...perfil, cvUrl: response.cvUrl, cvFileName: response.cvFileName };
          });
        },
        error: (error) => {
          console.error('Error al subir CV:', error);
          this.isUploadingCV.set(false);
          this.snackBar.open('Error al subir el CV. Intenta nuevamente.', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  onCancelCVUpload() {
    this.selectedCVFile.set(null);
    this.isCVUploadPending.set(false);
  }

  private markFormGroupTouched() {
    Object.keys(this.editForm.controls).forEach(key => {
      this.editForm.get(key)?.markAsTouched();
    });

    this.languages.controls.forEach((group: any) => {
      Object.keys((group as FormGroup).controls).forEach(key => {
        (group as FormGroup).get(key)?.markAsTouched();
      });
    });
  }


  onMateriasFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;

    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xls' && extension !== 'xlsx') {
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

    console.log('Subiendo archivo de materias:', archivo.name);

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
          this.cargarPerfil();
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
    return materia.id || index;
  }


  private cargarOfertasAplicadas() {
    if (!this.isOwnProfile()) {
      return; 
    }

    this.isOfertasLoading = true;
    this.perfilService.getOfertasAplicadas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PagedOfertasAplicadasResponse) => {
          this.ofertasAplicadas = response.content;
          this.totalOfertasAplicadas = response.totalElements;
          this.isOfertasLoading = false;
          this.ofertasError = null;
        },
        error: (error: any) => {
          console.error('Error al cargar ofertas aplicadas:', error);
          this.isOfertasLoading = false;
          this.ofertasError = 'No pudimos cargar tus aplicaciones. Intenta nuevamente más tarde.';
        }
      });
  }

  trackByOferta(index: number, oferta: OfertaAplicada) {
    return oferta.id;
  }

  verDetalleOferta(ofertaId: number) {
    this.router.navigate(['/oferta', ofertaId]);
  }

  isOwnProfile(): boolean {
    return !this.route.snapshot.queryParams['userId'] && !this.route.snapshot.params['id'];
  }


  private cargarOfertasPublicadas() {
    if (!this.isOwnProfile()) {
      return; 
    }

    // Asegurar que usamos el ID de usuario (UserEntity.id), no el del estudiante
    const perfilActual = this.perfilAlumno();
    if (!perfilActual) {
      console.warn('⚠️ No se puede cargar ofertas publicadas: perfil no disponible');
      this.ofertasPublicadas = [];
      this.totalOfertasPublicadas = 0;
      this.isOfertasPublicadasLoading = false;
      return;
    }

    this.isOfertasPublicadasLoading = true;

    // Versión original: solo filtra por bidderId usando el id del usuario autenticado
    this.authService.getCurrentUserId()
      .pipe(
        switchMap(userId => this.ofertasService.getoffers({ bidderId: userId })),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: PagedResponseDTO<OfertaListaDTO>) => {
          this.ofertasPublicadas = response.content;
          this.totalOfertasPublicadas = response.totalElements;
          this.isOfertasPublicadasLoading = false;
          this.ofertasPublicadasError = null;
        },
        error: (error: any) => {
          console.error('Error al cargar ofertas publicadas:', error);
          this.isOfertasPublicadasLoading = false;
          this.ofertasPublicadasError = 'No pudimos cargar tus publicaciones. Intenta nuevamente más tarde.';
        }
      });
  }

  trackByOfertaPublicada(index: number, oferta: OfertaListaDTO) {
    return oferta.id;
  }


  private expandedCoverLetters = new Set<number>();

  getStatusClass(status?: string): string {
    switch(status) {
      case 'PENDING': return 'status-pending';
      case 'REVIEWED': return 'status-reviewed';
      case 'ACCEPTED': return 'status-accepted';
      case 'REJECTED': return 'status-rejected';
      case 'WITHDRAWN': return 'status-withdrawn';
      default: return 'status-pending';
    }
  }

  getStatusIcon(status?: string): string {
    switch(status) {
      case 'PENDING': return 'schedule';
      case 'REVIEWED': return 'visibility';
      case 'ACCEPTED': return 'check_circle';
      case 'REJECTED': return 'cancel';
      case 'WITHDRAWN': return 'remove_circle';
      default: return 'schedule';
    }
  }

  getStatusText(status?: string): string {
    switch(status) {
      case 'PENDING': return 'Pendiente';
      case 'REVIEWED': return 'Revisada';
      case 'ACCEPTED': return 'Aceptada';
      case 'REJECTED': return 'Rechazada';
      case 'WITHDRAWN': return 'Retirada';
      default: return 'Pendiente';
    }
  }

  getModalityClass(modality: string): string {
    switch(modality.toUpperCase()) {
      case 'REMOTE': return 'modality-remote';
      case 'HYBRID': return 'modality-hybrid';
      case 'ON_SITE':
      case 'PRESENCIAL': return 'modality-onsite';
      default: return 'modality-hybrid';
    }
  }

  getModalityIcon(modality: string): string {
    switch(modality.toUpperCase()) {
      case 'REMOTE': return 'home';
      case 'HYBRID': return 'work_history';
      case 'ON_SITE':
      case 'PRESENCIAL': return 'business';
      default: return 'work_history';
    }
  }

  getModalityText(modality: string): string {
    switch(modality.toUpperCase()) {
      case 'REMOTE': return 'Remoto';
      case 'HYBRID': return 'Híbrido';
      case 'ON_SITE':
      case 'PRESENCIAL': return 'Presencial';
      default: return modality;
    }
  }

  isDescriptionLong(description: string): boolean {
    return description ? description.length > 200 : false;
  }

  toggleCoverLetter(applicationId: number) {
    if (this.expandedCoverLetters.has(applicationId)) {
      this.expandedCoverLetters.delete(applicationId);
    } else {
      this.expandedCoverLetters.add(applicationId);
    }
  }

  isCoverLetterExpanded(applicationId: number): boolean {
    return this.expandedCoverLetters.has(applicationId);
  }

  hasTimelineData(aplicacion: OfertaAplicada): boolean {
    return !!(aplicacion.applicationDate || aplicacion.offer?.expirationDate);
  }

  contactarEmpresa(offer: any) {
    // TODO: Implementar navegación a perfil de empresa
    console.log('Contactar empresa:', offer.company?.name);
  }

  retirarAplicacion(applicationId: number) {
    this.perfilService.retirarAplicacion(applicationId).subscribe({
      next: () => {
        this.snackBar.open('Aplicación retirada exitosamente', 'Cerrar', {
          duration: 3000
        });
        this.cargarOfertasAplicadas();
      },
      error: (error) => {
        console.error('Error al retirar aplicación:', error);
        this.snackBar.open('No pudimos retirar la aplicación. Intenta nuevamente más tarde.', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  canWithdrawApplication(status?: string): boolean {
    return status === 'PENDING' || status === 'REVIEWED' || !status;
  }


  formatMonthYear(dateString: string): string {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }

  calculateDuration(startDate: string, endDate?: string): string {
    if (!startDate) return '';
    
    const start = new Date(startDate + '-01');
    const end = endDate ? new Date(endDate + '-01') : new Date();
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years} año${years > 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`;
    } else if (years > 0) {
      return `${years} año${years > 1 ? 's' : ''}`;
    } else {
      return `${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`;
    }
  }

   navigateToCompanyProfile(companyId: number) {
    this.router.navigate(['/perfil-empresa', companyId]);
  }

   openExternalLink(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  trackByCompanyId(index: number, company: AssociatedCompanyDTO): number {
    return company.id;
  }

  trackByExperienceId(index: number, experience: WorkExperienceDTO): number {
    return experience.id || index;
  }

  trackByProjectId(index: number, project: PersonalProjectDTO): number {
    return project.id || index;
  }

  onImageError(event: Event, fallbackName: string) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=667eea&color=fff`;
    }
  }

  agregarExperienciaLaboral() {
    const dialogData: WorkExperienceDialogData = {
      isEditing: false
    };

    const dialogRef = this.dialog.open(WorkExperienceDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: CreateWorkExperienceDTO) => {
      if (result) {
        // Obtener el studentId del perfil actual
        const studentId = this.perfilAlumno()?.id;
        if (!studentId) {
          this.snackBar.open('Error: No se pudo identificar el estudiante', 'Cerrar', {
            duration: 3000
          });
          return;
        }

        // Agregar el studentId al DTO
        const experienciaConStudentId: CreateWorkExperienceDTO = {
          ...result,
          studentId: studentId
        };

        this.perfilService.crearExperienciaLaboral(experienciaConStudentId).subscribe({
          next: () => {
            this.snackBar.open('Experiencia laboral agregada exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarPerfil();
          },
          error: (error) => {
            console.error('Error al agregar experiencia laboral:', error);
            this.snackBar.open('Error al agregar la experiencia laboral', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  editarExperienciaLaboral(experiencia: WorkExperienceDTO) {
    const dialogData: WorkExperienceDialogData = {
      experience: experiencia,
      isEditing: true
    };

    const dialogRef = this.dialog.open(WorkExperienceDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: UpdateWorkExperienceDTO) => {
      if (result && experiencia.id) {
        // Obtener el studentId del perfil actual
        const studentId = this.perfilAlumno()?.id;
        if (!studentId) {
          this.snackBar.open('Error: No se pudo identificar el estudiante', 'Cerrar', {
            duration: 3000
          });
          return;
        }

        // Agregar el studentId al DTO
        const experienciaConStudentId: UpdateWorkExperienceDTO = {
          ...result,
          studentId: studentId
        };

        this.perfilService.actualizarExperienciaLaboral(experiencia.id, experienciaConStudentId).subscribe({
          next: () => {
            this.snackBar.open('Experiencia laboral actualizada exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarPerfil();
          },
          error: (error) => {
            console.error('Error al actualizar experiencia laboral:', error);
            this.snackBar.open('Error al actualizar la experiencia laboral', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  eliminarExperienciaLaboral(experienciaId: number) {
    if (!experienciaId) {
      this.snackBar.open('No se puede eliminar esta experiencia', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar esta experiencia laboral?')) {
      this.perfilService.eliminarExperienciaLaboral(experienciaId).subscribe({
        next: () => {
          this.snackBar.open('Experiencia laboral eliminada exitosamente', 'Cerrar', {
            duration: 3000
          });
          // Recargar el perfil
          this.cargarPerfil();
        },
        error: (error) => {
          console.error('Error al eliminar experiencia laboral:', error);
          this.snackBar.open('Error al eliminar la experiencia laboral', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  agregarProyectoPersonal() {
    const dialogData: PersonalProjectDialogData = {
      isEditing: false
    };

    const dialogRef = this.dialog.open(PersonalProjectDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: Omit<CreatePersonalProjectDTO, 'studentId'>) => {
      if (result) {
        // Obtener el studentId del perfil actual
        const studentId = this.perfilAlumno()?.id;
        if (!studentId) {
          this.snackBar.open('Error: No se pudo identificar el estudiante', 'Cerrar', {
            duration: 3000
          });
          return;
        }

        // Agregar el studentId al DTO
        const proyectoConStudentId: CreatePersonalProjectDTO = {
          ...result,
          studentId: studentId
        };

        this.perfilService.crearProyectoPersonal(proyectoConStudentId).subscribe({
          next: () => {
            this.snackBar.open('Proyecto personal agregado exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarPerfil();
          },
          error: (error) => {
            console.error('Error al agregar proyecto personal:', error);
            this.snackBar.open('Error al agregar el proyecto personal', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  editarProyectoPersonal(proyecto: PersonalProjectDTO) {
    const dialogData: PersonalProjectDialogData = {
      project: proyecto,
      isEditing: true
    };

    const dialogRef = this.dialog.open(PersonalProjectDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: Partial<UpdatePersonalProjectDTO>) => {
      if (result && proyecto.id) {
        // Obtener el studentId del perfil actual
        const studentId = this.perfilAlumno()?.id;
        if (!studentId) {
          this.snackBar.open('Error: No se pudo identificar el estudiante', 'Cerrar', {
            duration: 3000
          });
          return;
        }

        // Agregar el studentId al DTO
        const proyectoConStudentId: UpdatePersonalProjectDTO = {
          ...result,
          studentId: studentId
        };

        this.perfilService.actualizarProyectoPersonal(proyecto.id, proyectoConStudentId).subscribe({
          next: () => {
            this.snackBar.open('Proyecto personal actualizado exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarPerfil();
          },
          error: (error) => {
            console.error('Error al actualizar proyecto personal:', error);
            this.snackBar.open('Error al actualizar el proyecto personal', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  eliminarProyectoPersonal(proyectoId: number) {
    if (!proyectoId) {
      this.snackBar.open('No se puede eliminar este proyecto', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este proyecto personal?')) {
      this.perfilService.eliminarProyectoPersonal(proyectoId).subscribe({
        next: () => {
          this.snackBar.open('Proyecto personal eliminado exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.cargarPerfil();
        },
        error: (error) => {
          console.error('Error al eliminar proyecto personal:', error);
          this.snackBar.open('Error al eliminar el proyecto personal', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }
}
