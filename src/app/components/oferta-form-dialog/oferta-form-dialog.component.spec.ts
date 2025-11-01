import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { OfertaFormDialogComponent, OfertaFormDialogData } from './oferta-form-dialog.component';
import { OfertaLaboralDTO, ModalidadTrabajo } from '../../models/oferta-laboral.dto';
import { AuthService } from '../../services/auth.service';

describe('OfertaFormDialogComponent - Edit Functionality', () => {
  let component: OfertaFormDialogComponent;
  let fixture: ComponentFixture<OfertaFormDialogComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<OfertaFormDialogComponent>>;

  const mockOferta: OfertaLaboralDTO = {
    id: 1,
    title: 'Desarrollador Frontend',
    description: 'Descripción de prueba para el puesto de desarrollador frontend',
    requirements: 'Requisitos de prueba para el puesto',
    modality: ModalidadTrabajo.REMOTO,
    location: 'Buenos Aires',
    estimatedPayment: 2000,
    applyList: [],
    bidder: {
      id: 123,
      name: 'Empresa Test',
      industry: 'Tecnología'
    }
  };

  const mockDialogData: OfertaFormDialogData = {
    isEditing: true,
    oferta: mockOferta
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      keycloakUser: { id: 123, email: 'test@test.com' }
    });
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        OfertaFormDialogComponent,
        NoopAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OfertaFormDialogComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<OfertaFormDialogComponent>>;
  });

  it('should create component for editing', () => {
    expect(component).toBeTruthy();
    expect(component.data.isEditing).toBe(true);
    expect(component.data.oferta).toEqual(mockOferta);
  });

  it('should load offer data when editing', () => {
    fixture.detectChanges();
    
    expect(component.ofertaForm.get('title')?.value).toBe(mockOferta.title);
    expect(component.ofertaForm.get('description')?.value).toBe(mockOferta.description);
    expect(component.ofertaForm.get('requirements')?.value).toBe(mockOferta.requirements);
    expect(component.ofertaForm.get('modality')?.value).toBe(mockOferta.modality);
    expect(component.ofertaForm.get('location')?.value).toBe(mockOferta.location);
    expect(component.ofertaForm.get('estimatedPayment')?.value).toBe(mockOferta.estimatedPayment);
  });

  it('should validate edit permissions for correct user', () => {
    // User ID matches offer bidder ID
    mockAuthService.keycloakUser = { id: 123, email: 'test@test.com' } as any;
    
    fixture.detectChanges();
    
    // Should not close dialog if user has permissions
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should prevent editing for unauthorized user', () => {
    // User ID does not match offer bidder ID
    mockAuthService.keycloakUser = { id: 999, email: 'other@test.com' } as any;
    
    fixture.detectChanges();
    
    // Should close dialog if user doesn't have permissions
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should show correct dialog title for editing', () => {
    fixture.detectChanges();
    
    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement.textContent).toContain('Editar Oferta Laboral');
  });

  it('should show correct submit button text for editing', () => {
    fixture.detectChanges();
    
    const submitButton = fixture.nativeElement.querySelector('.submit-button');
    expect(submitButton.textContent).toContain('Guardar Cambios');
  });
});