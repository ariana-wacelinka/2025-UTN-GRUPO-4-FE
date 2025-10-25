import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { PerfilAlumnoComponent } from './perfil-alumno.component';
import { PerfilAlumnoService, PerfilAlumnoDTO, MateriasState } from '../../services/perfil-alumno.service';

describe('PerfilAlumnoComponent', () => {
  let component: PerfilAlumnoComponent;
  let fixture: ComponentFixture<PerfilAlumnoComponent>;
  let mockPerfilService: jasmine.SpyObj<PerfilAlumnoService>;
  let snackBar: MatSnackBar;

  const mockPerfil: PerfilAlumnoDTO = {
    id: 1,
    nombre: 'Test',
    apellido: 'User',
    imagen: 'test-image.jpg',
    email: 'test@test.com',
    linkedin: 'https://linkedin.com/test',
    github: 'https://github.com/test',
    carrera: 'Test Career',
    anio: '4to año',
    universidad: 'Test University',
    descripcion: 'Test description',
    sobreMi: 'Test about me section',
    habilidades: ['JavaScript', 'Angular'],
    idiomas: [{ idioma: 'Español', nivel: 'Nativo' }],
    telefono: '+54 123 456 789',
    ubicacion: 'Test City',
    fechaNacimiento: '01/01/2000',
    curriculumUrl: '/assets/test-cv.pdf'
  };

  const mockMateriasState: MateriasState = {
    materias: [
      { codigo: '123', nombre: 'Algoritmos', nota: 9, estado: 'Aprobada', fechaAprobacion: '2024-01-10' },
      { codigo: '456', nombre: 'Álgebra', nota: 8, estado: 'Aprobada', fechaAprobacion: '2023-11-20' }
    ],
    promedioGeneral: 8.5,
    totalMaterias: 2
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PerfilAlumnoService', [
      'getPerfil',
      'actualizarPerfil',
      'descargarCV',
      'obtenerMateriasState',
      'cargarMateriasDesdeBackend',
      'subirMateriasExcel'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        PerfilAlumnoComponent,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: PerfilAlumnoService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilAlumnoComponent);
    component = fixture.componentInstance;
    mockPerfilService = TestBed.inject(PerfilAlumnoService) as jasmine.SpyObj<PerfilAlumnoService>;
    snackBar = TestBed.inject(MatSnackBar);

    mockPerfilService.getPerfil.and.returnValue(of(mockPerfil));
    mockPerfilService.obtenerMateriasState.and.returnValue(of(mockMateriasState));
    mockPerfilService.cargarMateriasDesdeBackend.and.returnValue(of(mockMateriasState));
    mockPerfilService.subirMateriasExcel.and.returnValue(of(mockMateriasState));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      mockPerfilService.getPerfil.and.returnValue(of(mockPerfil));
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      mockPerfilService.getPerfil.and.returnValue(of(mockPerfil));

      expect(component.isEditing).toBe(false);
      expect(component.isLoading).toBe(false);
      expect(component.perfilAlumno).toBeNull();
      expect(component.editForm).toBeDefined();
    });

    it('should load profile on init', () => {
      mockPerfilService.getPerfil.and.returnValue(of(mockPerfil));

      component.ngOnInit();

      expect(mockPerfilService.getPerfil).toHaveBeenCalled();
      expect(mockPerfilService.cargarMateriasDesdeBackend).toHaveBeenCalled();
      expect(component.perfilAlumno).toEqual(mockPerfil);
      expect(component.isLoading).toBe(false);
      expect(component.materiasAlumno.length).toBe(mockMateriasState.materias.length);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockPerfilService.getPerfil.and.returnValue(of(mockPerfil));
      component.ngOnInit();
    });

    it('should validate email format', () => {
      const emailControl = component.editForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should validate minimum length for nombre and apellido', () => {
      const nombreControl = component.editForm.get('nombre');
      const apellidoControl = component.editForm.get('apellido');

      nombreControl?.setValue('A');
      apellidoControl?.setValue('B');

      expect(nombreControl?.hasError('minlength')).toBe(true);
      expect(apellidoControl?.hasError('minlength')).toBe(true);

      nombreControl?.setValue('Ana');
      apellidoControl?.setValue('García');

      expect(nombreControl?.hasError('minlength')).toBe(false);
      expect(apellidoControl?.hasError('minlength')).toBe(false);
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockPerfilService.getPerfil.and.returnValue(of(mockPerfil));
      component.ngOnInit();
    });

    it('should enter edit mode', () => {
      component.editarPerfil();

      expect(component.isEditing).toBe(true);
      expect(component.editForm.get('nombre')?.value).toBe(mockPerfil.nombre);
      expect(component.editForm.get('email')?.value).toBe(mockPerfil.email);
    });

    it('should exit edit mode on cancel', () => {
      component.editarPerfil();
      component.editForm.get('nombre')?.setValue('Changed Name');

      component.cancelarEdicion();

      expect(component.isEditing).toBe(false);
      expect(component.editForm.get('nombre')?.value).toBe(mockPerfil.nombre);
    });
  });
  
    describe('Materias upload', () => {
      beforeEach(() => {
        component.ngOnInit();
      });

      it('should show materias state after init', () => {
        expect(component.materiasAlumno.length).toBe(mockMateriasState.materias.length);
        expect(component.promedioMaterias).toBe(mockMateriasState.promedioGeneral);
      });

      it('should reject invalid file extensions', () => {
        const snackSpy = spyOn(snackBar, 'open');
        const mockInput = { files: [new File(['content'], 'materias.pdf', { type: 'application/pdf' })], value: 'materias.pdf' } as unknown as HTMLInputElement;

        component.onMateriasFileSelected({ target: mockInput } as unknown as Event);

        expect(mockPerfilService.subirMateriasExcel).not.toHaveBeenCalled();
        expect(snackSpy).toHaveBeenCalled();
        expect(mockInput.value).toBe('');
      });

      it('should upload materias excel and reset file name', () => {
        const snackSpy = spyOn(snackBar, 'open');
        const xlsFile = new File(['content'], 'materias.xls', { type: 'application/vnd.ms-excel' });
        const mockInput = { files: [xlsFile], value: 'materias.xls' } as unknown as HTMLInputElement;

        component.onMateriasFileSelected({ target: mockInput } as unknown as Event);

        expect(mockPerfilService.subirMateriasExcel).toHaveBeenCalledWith(xlsFile);
        expect(component.selectedMateriasFileName).toBeNull();
        expect(component.isMateriasUploading).toBeFalse();
        expect(snackSpy).toHaveBeenCalled();
        expect(mockInput.value).toBe('');
      });
    });

  describe('External Actions', () => {
    beforeEach(() => {
      mockPerfilService.getPerfil.and.returnValue(of(mockPerfil));
      component.ngOnInit();
    });

    it('should open external link', () => {
      spyOn(window, 'open');
      const testUrl = 'https://test.com';

      component.abrirEnlace(testUrl);

      expect(window.open).toHaveBeenCalledWith(testUrl, '_blank');
    });

    it('should download CV', () => {
      component.descargarCV();

      expect(mockPerfilService.descargarCV).toHaveBeenCalled();
    });
  });
});
