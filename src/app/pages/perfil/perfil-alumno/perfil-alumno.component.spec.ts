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
import { EstudianteDTO } from '../../../models/aplicante.dto';
import { PerfilAlumnoService, MateriasState } from '../../../services/perfil-alumno.service';

describe('PerfilAlumnoComponent', () => {
  let component: PerfilAlumnoComponent;
  let fixture: ComponentFixture<PerfilAlumnoComponent>;
  let mockPerfilService: jasmine.SpyObj<PerfilAlumnoService>;
  let snackBar: MatSnackBar;

  const mockPerfil: EstudianteDTO = {
    id: 1,
    description: 'Test description',
    phone: '+54 123 456 789',
    email: 'test@test.com',
    location: 'Test City',
    name: 'Test',
    surname: 'User',
    imageUrl: 'test-image.jpg',
    linkedinUrl: 'https://linkedin.com/test',
    role: 'estudiante',
    githubUrl: 'https://github.com/test',
    career: 'Test Career',
    currentYearLevel: 4,
    institution: 'Test University',
    skills: ['JavaScript', 'Angular'],
    incomeDate: '2020-03-01',
    dateOfBirth: '01/01/2000',
    cvUrl: '/assets/test-cv.pdf',
    cvFileName: 'test-cv.pdf',
    coverLetter: 'Test cover letter',
    languages: [{ id: 1, name: 'Español', level: 5 }]
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

      expect(component.isEditing()).toBe(false);
      expect(component.isLoading()).toBe(false);
      expect(component.perfilAlumno()).toBeNull();
      expect(component.editForm).toBeDefined();
    });

    it('should load profile on init', () => {
      mockPerfilService.getPerfil.and.returnValue(of(mockPerfil));

      component.ngOnInit();

      expect(mockPerfilService.getPerfil).toHaveBeenCalled();
      expect(mockPerfilService.cargarMateriasDesdeBackend).toHaveBeenCalled();
      expect(component.perfilAlumno()).toEqual(mockPerfil);
      expect(component.isLoading()).toBe(false);
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

    it('should validate minimum length for name and surname', () => {
      const nameControl = component.editForm.get('name');
      const surnameControl = component.editForm.get('surname');

      nameControl?.setValue('A');
      surnameControl?.setValue('B');

      expect(nameControl?.hasError('minlength')).toBe(true);
      expect(surnameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('Ana');
      surnameControl?.setValue('García');

      expect(nameControl?.hasError('minlength')).toBe(false);
      expect(surnameControl?.hasError('minlength')).toBe(false);
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockPerfilService.getPerfil.and.returnValue(of(mockPerfil));
      component.ngOnInit();
    });

    it('should enter edit mode', () => {
      component.onEditProfile();

      expect(component.isEditing()).toBe(true);
      expect(component.editForm.get('name')?.value).toBe(mockPerfil.name);
      expect(component.editForm.get('email')?.value).toBe(mockPerfil.email);
    });

    it('should exit edit mode on cancel', () => {
      component.onEditProfile();
      component.editForm.get('name')?.setValue('Changed Name');

      component.onCancelEdit();

      expect(component.isEditing()).toBe(false);
      expect(component.editForm.get('name')?.value).toBe(mockPerfil.name);
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
