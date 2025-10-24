import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { PerfilAlumnoService } from '../../../services/perfil-alumno.service';
import { EstudianteDTO, ActualizarEstudianteDTO, IdiomaDTO } from '../../../models/aplicante.dto';
import { Subject, takeUntil } from 'rxjs';

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
    ReactiveFormsModule
  ],
  templateUrl: './perfil-alumno.component.html',
  styleUrl: './perfil-alumno.component.scss'
})
export class PerfilAlumnoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isEditing = false;
  editForm!: FormGroup;
  perfilAlumno: EstudianteDTO | null = null;
  isLoading = false;
  selectedImageFile: File | null = null;
  selectedCVFile: File | null = null;
  imagePreview: string | null = null;

  nivelesIdioma = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];
  habilidadesDisponibles = [
    'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue.js', 'Node.js',
    'Python', 'Java', 'C#', 'PHP', 'MySQL', 'PostgreSQL', 'MongoDB',
    'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'HTML', 'CSS',
    'SCSS', 'Bootstrap', 'Tailwind CSS', 'Express.js', 'Spring Boot',
    'Django', 'Flask', 'Laravel', '.NET', 'REST APIs', 'GraphQL'
  ];

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
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      ubicacion: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],

      carrera: ['', [Validators.required]],
      anio: ['', [Validators.required]],
      universidad: ['', [Validators.required]],

      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      sobreMi: ['', [Validators.maxLength(1000)]],

      linkedin: [''],
      github: [''],

      habilidades: this.formBuilder.array([]),
      idiomas: this.formBuilder.array([])
    });
  }

  ngOnInit() {
    this.cargarPerfil();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarPerfil() {
    this.isLoading = true;

    // Verificar si hay un userId en los query params (viene de ver aplicantes)
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];

      if (userId) {
        // TODO Sprint 2: Reemplazar con llamada al backend
        // this.perfilService.getPerfilByUserId(userId).subscribe(...)
        this.perfilAlumno = this.getMockPerfilByUserId(Number(userId));
        this.isLoading = false;
      } else {
        // Cargar perfil del usuario actual
        this.perfilService.getPerfil()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (perfil) => {
              this.perfilAlumno = perfil;
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error al cargar el perfil:', error);
              this.isLoading = false;
            }
          });
      }
    });
  }

  /**
   * Mock de perfiles de aplicantes
   * TODO Sprint 2: Eliminar y usar servicio real con backend
   */
  private getMockPerfilByUserId(userId: number): EstudianteDTO {
    const mockPerfiles: { [key: number]: EstudianteDTO } = {
      101: {
        id: 1,
        nombre: 'Ariana',
        apellido: 'Wacelinka',
        email: 'wacelinka@example.com',
        telefono: '+54 9 11 2345-6789',
        ubicacion: 'La Plata, Buenos Aires',
        fechaNacimiento: '2002-03-15',
        imagen: 'https://i.pravatar.cc/300?img=47',
        carrera: 'Ingeniería en Sistemas de Información',
        anio: '3',
        universidad: 'UTN FRLP',
        descripcion: 'Estudiante apasionada por el desarrollo full-stack y las metodologías ágiles.',
        habilidades: ['Angular', 'TypeScript', 'Node.js', 'MongoDB', 'Git', 'Scrum'],
        idiomas: [
          { idioma: 'Español', nivel: 'Nativo' },
          { idioma: 'Inglés', nivel: 'Avanzado' }
        ],
        linkedin: 'https://linkedin.com/in/ariana-wacelinka',
        github: 'https://github.com/ariana-wacelinka',
        cvUrl: '/assets/documents/WACELINKA, Ariana.pdf'
      },
      102: {
        id: 2,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'jperez@example.com',
        telefono: '+54 9 11 3456-7890',
        ubicacion: 'Buenos Aires, Argentina',
        fechaNacimiento: '2001-07-22',
        imagen: 'https://i.pravatar.cc/300?img=12',
        carrera: 'Ingeniería en Sistemas de Información',
        anio: '4',
        universidad: 'UTN FRLP',
        descripcion: 'Desarrollador full-stack con 3 años de experiencia en proyectos web.',
        habilidades: ['Angular', 'React', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
        idiomas: [
          { idioma: 'Español', nivel: 'Nativo' },
          { idioma: 'Inglés', nivel: 'Intermedio' }
        ],
        linkedin: 'https://linkedin.com/in/juan-perez',
        github: 'https://github.com/juanperez',
        cvUrl: '/assets/documents/PEREZ_Juan.pdf'
      },
      103: {
        id: 3,
        nombre: 'María',
        apellido: 'González',
        email: 'mgonzalez@example.com',
        telefono: '+54 9 11 4567-8901',
        ubicacion: 'Córdoba, Argentina',
        fechaNacimiento: '2003-11-08',
        imagen: 'https://i.pravatar.cc/300?img=32',
        carrera: 'Ingeniería en Sistemas de Información',
        anio: '2',
        universidad: 'UTN FRLP',
        descripcion: 'Estudiante enfocada en desarrollo frontend y UX/UI.',
        habilidades: ['Angular', 'HTML', 'CSS', 'SCSS', 'Figma', 'JavaScript'],
        idiomas: [
          { idioma: 'Español', nivel: 'Nativo' },
          { idioma: 'Inglés', nivel: 'Básico' }
        ],
        linkedin: 'https://linkedin.com/in/maria-gonzalez',
        github: 'https://github.com/mariagonzalez',
        cvUrl: '/assets/documents/GONZALEZ_Maria.pdf'
      },
      104: {
        id: 4,
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        email: 'crodriguez@example.com',
        telefono: '+54 9 11 5678-9012',
        ubicacion: 'Rosario, Santa Fe',
        fechaNacimiento: '2002-05-19',
        imagen: 'https://i.pravatar.cc/300?img=15',
        carrera: 'Ingeniería en Sistemas de Información',
        anio: '3',
        universidad: 'UTN FRLP',
        descripcion: 'Desarrollador frontend especializado en React y ecosistema JavaScript moderno.',
        habilidades: ['React', 'JavaScript', 'TypeScript', 'Redux', 'Next.js', 'Tailwind CSS'],
        idiomas: [
          { idioma: 'Español', nivel: 'Nativo' },
          { idioma: 'Inglés', nivel: 'Avanzado' },
          { idioma: 'Portugués', nivel: 'Intermedio' }
        ],
        linkedin: 'https://linkedin.com/in/carlos-rodriguez',
        github: 'https://github.com/carlosrodriguez',
        cvUrl: '/assets/documents/RODRIGUEZ_Carlos.pdf'
      },
      105: {
        id: 5,
        nombre: 'Laura',
        apellido: 'Martínez',
        email: 'lmartinez@example.com',
        telefono: '+54 9 11 6789-0123',
        ubicacion: 'Mendoza, Argentina',
        fechaNacimiento: '2001-09-14',
        imagen: 'https://i.pravatar.cc/300?img=44',
        carrera: 'Ingeniería en Sistemas de Información',
        anio: '4',
        universidad: 'UTN FRLP',
        descripcion: 'Frontend developer con fuerte enfoque en UX/UI y accesibilidad.',
        habilidades: ['React', 'Vue.js', 'HTML', 'CSS', 'JavaScript', 'Figma', 'Adobe XD'],
        idiomas: [
          { idioma: 'Español', nivel: 'Nativo' },
          { idioma: 'Inglés', nivel: 'Avanzado' }
        ],
        linkedin: 'https://linkedin.com/in/laura-martinez',
        github: 'https://github.com/lauramartinez',
        cvUrl: '/assets/documents/MARTINEZ_Laura.pdf'
      },
      106: {
        id: 6,
        nombre: 'Diego',
        apellido: 'Fernández',
        email: 'dfernandez@example.com',
        telefono: '+54 9 11 7890-1234',
        ubicacion: 'San Miguel de Tucumán, Tucumán',
        fechaNacimiento: '2000-12-03',
        imagen: 'https://i.pravatar.cc/300?img=68',
        carrera: 'Ingeniería en Sistemas de Información',
        anio: '5',
        universidad: 'UTN FRLP',
        descripcion: 'Backend developer senior con 5 años de experiencia en Java y Spring Boot.',
        habilidades: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Redis'],
        idiomas: [
          { idioma: 'Español', nivel: 'Nativo' },
          { idioma: 'Inglés', nivel: 'Avanzado' },
          { idioma: 'Alemán', nivel: 'Básico' }
        ],
        linkedin: 'https://linkedin.com/in/diego-fernandez',
        github: 'https://github.com/diegofernandez',
        cvUrl: '/assets/documents/FERNANDEZ_Diego.pdf'
      }
    };

    return mockPerfiles[userId] || mockPerfiles[101]; // Default a Ariana si no existe
  }

  abrirEnlace(url: string) {
    window.open(url, '_blank');
  }

  descargarCV() {
    try {
      this.perfilService.descargarCV();
    } catch (error) {
      console.error('Error al descargar CV:', error);
    }
  }

  editarPerfil() {
    if (!this.perfilAlumno) return;

    this.isEditing = true;
    this.imagePreview = this.perfilAlumno.imagen;

    this.editForm.patchValue({
      nombre: this.perfilAlumno.nombre,
      apellido: this.perfilAlumno.apellido,
      email: this.perfilAlumno.email,
      telefono: this.perfilAlumno.telefono,
      ubicacion: this.perfilAlumno.ubicacion,
      fechaNacimiento: this.perfilAlumno.fechaNacimiento,
      carrera: this.perfilAlumno.carrera,
      anio: this.perfilAlumno.anio,
      universidad: this.perfilAlumno.universidad,
      descripcion: this.perfilAlumno.descripcion,
      linkedin: this.perfilAlumno.linkedin,
      github: this.perfilAlumno.github
    });

    this.setHabilidades(this.perfilAlumno.habilidades);
    this.setIdiomas(this.perfilAlumno.idiomas);
  }

  cancelarEdicion() {
    this.isEditing = false;
    this.selectedImageFile = null;
    this.selectedCVFile = null;
    this.imagePreview = null;

    if (this.perfilAlumno) {
      this.editForm.patchValue(this.perfilAlumno);
      this.setHabilidades(this.perfilAlumno.habilidades);
      this.setIdiomas(this.perfilAlumno.idiomas);
      this.imagePreview = this.perfilAlumno.imagen;
    }
  }

  async guardarCambios() {
    if (this.editForm.valid && this.perfilAlumno) {
      this.isLoading = true;

      try {
        if (this.selectedImageFile) {
          await this.perfilService.subirImagenPerfil(this.selectedImageFile).toPromise();
        }

        if (this.selectedCVFile) {
          await this.perfilService.subirCV(this.selectedCVFile).toPromise();
        }

        const datosActualizados: ActualizarEstudianteDTO = {
          ...this.editForm.value,
          habilidades: this.habilidades.value,
          idiomas: this.idiomas.value
        };

        this.perfilService.actualizarPerfil(datosActualizados)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (perfilActualizado) => {
              this.isEditing = false;
              this.isLoading = false;
              this.selectedImageFile = null;
              this.selectedCVFile = null;

              this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
                duration: 3000
              });
            },
            error: (error) => {
              console.error('Error al actualizar el perfil:', error);
              this.isLoading = false;
              this.snackBar.open('Error al actualizar el perfil', 'Cerrar', {
                duration: 3000
              });
            }
          });

      } catch (error) {
        console.error('Error al procesar archivos:', error);
        this.isLoading = false;
        this.snackBar.open('Error al procesar archivos', 'Cerrar', {
          duration: 3000
        });
      }
    } else {
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });

      this.habilidades.controls.forEach(control => control.markAsTouched());
      this.idiomas.controls.forEach(group => {
        Object.keys((group as FormGroup).controls).forEach(key => {
          (group as FormGroup).get(key)?.markAsTouched();
        });
      });
    }
  }

  get f() {
    return this.editForm.controls;
  }

  get habilidades(): FormArray {
    return this.editForm.get('habilidades') as FormArray;
  }

  get idiomas(): FormArray {
    return this.editForm.get('idiomas') as FormArray;
  }

  private setHabilidades(habilidades: string[]) {
    const habilidadesArray = this.editForm.get('habilidades') as FormArray;
    habilidadesArray.clear();
    habilidades.forEach(habilidad => {
      habilidadesArray.push(this.formBuilder.control(habilidad, Validators.required));
    });
  }

  agregarHabilidad() {
    this.habilidades.push(this.formBuilder.control('', Validators.required));
  }

  eliminarHabilidad(index: number) {
    this.habilidades.removeAt(index);
  }

  private setIdiomas(idiomas: IdiomaDTO[]) {
    const idiomasArray = this.editForm.get('idiomas') as FormArray;
    idiomasArray.clear();
    idiomas.forEach(idioma => {
      idiomasArray.push(this.formBuilder.group({
        idioma: [idioma.idioma, Validators.required],
        nivel: [idioma.nivel, Validators.required]
      }));
    });
  }

  agregarIdioma() {
    const idiomaGroup = this.formBuilder.group({
      idioma: ['', Validators.required],
      nivel: ['', Validators.required]
    });
    this.idiomas.push(idiomaGroup);
  }

  eliminarIdioma(index: number) {
    this.idiomas.removeAt(index);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImageFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.snackBar.open('Por favor selecciona un archivo de imagen válido', 'Cerrar', {
        duration: 3000
      });
    }
  }

  onCVSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedCVFile = file;
      this.snackBar.open('CV seleccionado correctamente', 'Cerrar', {
        duration: 2000
      });
    } else {
      this.snackBar.open('Por favor selecciona un archivo PDF válido', 'Cerrar', {
        duration: 3000
      });
    }
  }
}