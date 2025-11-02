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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { PerfilAlumnoService, MateriasState, PagedOfertasAplicadasResponse, OfertaAplicada, ApplicationStatus, OfferDetails } from '../../../services/perfil-alumno.service';
import { AuthService } from '../../../services/auth.service';
import { AtributosService } from '../../../services/atributos.service';
import { EstudianteDTO, ActualizarEstudianteDTO } from '../../../models/aplicante.dto';
import { IdiomaDTO } from '../../../models/usuario.dto';
import { Subject, takeUntil, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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

  // Computed para saber si ya hay un CV cargado
  hasCVUploaded = computed(() => {
    const perfil = this.perfilAlumno();
    return perfil?.cvUrl ? true : false;
  });

  // Materias - Nueva funcionalidad
  materiasAlumno: any[] = [];
  promedioMaterias = 0;
  totalMaterias = 0;
  isMateriasLoading = false;
  isMateriasUploading = false;
  materiasError: string | null = null;
  selectedMateriasFileName: string | null = null;
  private readonly MAX_MATERIAS_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Ofertas Aplicadas - Nueva funcionalidad
  ofertasAplicadas: OfertaAplicada[] = [];
  isOfertasLoading = false;
  ofertasError: string | null = null;
  totalOfertasAplicadas = 0;

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

    // Usar información del usuario actual si está disponible
    const currentUser = this.authService.keycloakUser;
    const displayName = currentUser ?
      `${currentUser.name || perfil.name} ${currentUser.surname || perfil.surname}` :
      `${perfil.name} ${perfil.surname}`;

    // Priorizar imagen del usuario actual si está disponible
    const imageUrl = currentUser?.imageUrl || perfil.imageUrl;

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

  constructor(
    private formBuilder: FormBuilder,
    private perfilService: PerfilAlumnoService,
    private authService: AuthService,
    private atributosService: AtributosService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    // Validador personalizado para URLs opcionales
    const urlValidator = (control: any) => {
      if (!control.value) return null; // Si está vacío, es válido (opcional)
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
      linkedinUrl: ['', [urlValidator]],
      githubUrl: ['', [urlValidator]],
      languages: this.formBuilder.array([])
    });
  }

  ngOnInit() {
    this.cargarPerfil();
    this.suscribirseAMaterias();
    this.obtenerMateriasDesdeBackend();
    this.cargarOfertasAplicadas();
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

        this.perfilService.getPerfil(userId)
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
      // Extraer el nombre de la habilidad de 'Crear "NombreHabilidad"'
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

    // Ya no necesitamos marcar skills como touched porque usamos signals
    this.languages.controls.forEach((group: any) => {
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

  // ============= MÉTODOS DE OFERTAS APLICADAS =============

  private cargarOfertasAplicadas() {
    // Solo cargar si es el perfil del usuario actual (no de otro aplicante)
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      if (!userId) { // Solo para el perfil propio
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
    });
  }

  trackByOferta(index: number, oferta: OfertaAplicada) {
    return oferta.id;
  }

  verDetalleOferta(ofertaId: number) {
    // Navegar al detalle de la oferta
    // TODO: Implementar navegación cuando esté disponible la ruta
    console.log('Ver detalle de oferta:', ofertaId);
  }

  isOwnProfile(): boolean {
    // Verificar si estamos viendo el perfil propio (sin userId en query params)
    return !this.route.snapshot.queryParams['userId'];
  }

  // ============= MÉTODOS PARA UI MEJORADA DE OFERTAS =============

  // Estado de expansión de cartas de presentación
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
}
