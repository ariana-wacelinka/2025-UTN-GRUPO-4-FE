import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { of } from 'rxjs';

import { PerfilAlumnoComponent } from './perfil-alumno.component';
import { PerfilAlumnoService, DEFAULT_MATERIAS_STATE } from '../../services/perfil-alumno.service';
import { API_URL } from '../../app.config';

describe('PerfilAlumnoComponent - Integration Tests', () => {
    let component: PerfilAlumnoComponent;
    let fixture: ComponentFixture<PerfilAlumnoComponent>;
    let service: PerfilAlumnoService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                PerfilAlumnoComponent,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatCardModule,
                MatButtonModule,
                MatIconModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatChipsModule,
                MatDividerModule,
                BrowserAnimationsModule
            ],
            providers: [
                PerfilAlumnoService,
                { provide: API_URL, useValue: 'http://localhost:3000/api' }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PerfilAlumnoComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(PerfilAlumnoService);

        spyOn(service, 'cargarMateriasDesdeBackend').and.returnValue(of(DEFAULT_MATERIAS_STATE));
    });

    describe('Profile Display Integration', () => {
        it('should display profile data correctly', () => {
            component.ngOnInit();
            fixture.detectChanges();

            // Verificar que el nombre se muestra correctamente
            const nameElement = fixture.debugElement.query(By.css('.profile-name'));
            expect(nameElement.nativeElement.textContent).toContain('Ariana Wacelinka');

            // Verificar que el email se muestra
            const emailElement = fixture.debugElement.query(By.css('.info-value'));
            expect(emailElement).toBeTruthy();
        });

        it('should show loading state initially', () => {
            component.isLoading = true;
            fixture.detectChanges();

            const loadingElement = fixture.debugElement.query(By.css('.loading-container'));
            expect(loadingElement).toBeTruthy();

            const loadingText = fixture.debugElement.query(By.css('.loading-container p'));
            expect(loadingText.nativeElement.textContent).toContain('Cargando perfil...');
        });

        it('should hide loading state when profile is loaded', () => {
            component.ngOnInit();
            fixture.detectChanges();

            const loadingElement = fixture.debugElement.query(By.css('.loading-container'));
            expect(loadingElement).toBeFalsy();

            const profileContent = fixture.debugElement.query(By.css('.profile-header'));
            expect(profileContent).toBeTruthy();
        });
    });

    describe('Edit Mode Integration', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should toggle edit mode when clicking edit button', () => {
            const editButton = fixture.debugElement.query(By.css('button[color="primary"]'));
            expect(editButton.nativeElement.textContent).toContain('Editar Perfil');

            editButton.nativeElement.click();
            fixture.detectChanges();

            expect(component.isEditing).toBe(true);

            const editForm = fixture.debugElement.query(By.css('.edit-form'));
            expect(editForm).toBeTruthy();
        });

        it('should show form fields in edit mode', () => {
            component.editarPerfil();
            fixture.detectChanges();

            const nombreField = fixture.debugElement.query(By.css('input[formControlName="nombre"]'));
            const emailField = fixture.debugElement.query(By.css('input[formControlName="email"]'));
            const descripcionField = fixture.debugElement.query(By.css('textarea[formControlName="descripcion"]'));

            expect(nombreField).toBeTruthy();
            expect(emailField).toBeTruthy();
            expect(descripcionField).toBeTruthy();
        });

        it('should show save and cancel buttons in edit mode', () => {
            component.editarPerfil();
            fixture.detectChanges();

            const saveButton = fixture.debugElement.query(By.css('button:contains("Guardar Cambios")'));
            const cancelButton = fixture.debugElement.query(By.css('button:contains("Cancelar")'));

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            const saveBtn = buttons.find(btn => btn.nativeElement.textContent.includes('Guardar'));
            const cancelBtn = buttons.find(btn => btn.nativeElement.textContent.includes('Cancelar'));

            expect(saveBtn).toBeTruthy();
            expect(cancelBtn).toBeTruthy();
        });
    });

    describe('Skills and Languages Display', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should display skills as chips', () => {
            const skillChips = fixture.debugElement.queryAll(By.css('.skill-chip'));
            expect(skillChips.length).toBeGreaterThan(0);

            const skillTexts = skillChips.map(chip => chip.nativeElement.textContent);
            expect(skillTexts).toContain('JavaScript');
            expect(skillTexts).toContain('Angular');
        });

        it('should display languages with levels', () => {
            const languageItems = fixture.debugElement.queryAll(By.css('.language-item'));
            expect(languageItems.length).toBeGreaterThan(0);

            const firstLanguage = languageItems[0];
            const languageName = firstLanguage.query(By.css('.language-name'));
            const languageLevel = firstLanguage.query(By.css('.language-level'));

            expect(languageName).toBeTruthy();
            expect(languageLevel).toBeTruthy();
        });
    });

    describe('Subjects Section Integration', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should render subjects card with summary data', () => {
            const subjectsCard = fixture.debugElement.query(By.css('.subjects-card'));
            expect(subjectsCard).toBeTruthy();

            const summaryValues = subjectsCard.queryAll(By.css('.summary-value'));
            expect(summaryValues.length).toBeGreaterThan(0);
            expect(summaryValues[0].nativeElement.textContent).toContain(DEFAULT_MATERIAS_STATE.totalMaterias.toString());
        });

        it('should list materias rows', () => {
            const rows = fixture.debugElement.queryAll(By.css('.subjects-table .table-row'));
            expect(rows.length).toBe(DEFAULT_MATERIAS_STATE.materias.length);
        });

        it('should have upload button available', () => {
            const uploadButton = fixture.debugElement.query(By.css('.subjects-card .upload-btn'));
            expect(uploadButton).toBeTruthy();
            expect(uploadButton.nativeElement.disabled).toBeFalse();
        });
    });

    describe('Social Links Integration', () => {
        beforeEach(() => {
            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should display social media buttons', () => {
            const linkedinBtn = fixture.debugElement.query(By.css('.linkedin-btn'));
            const githubBtn = fixture.debugElement.query(By.css('.github-btn'));
            const cvBtn = fixture.debugElement.query(By.css('.cv-btn'));

            expect(linkedinBtn).toBeTruthy();
            expect(githubBtn).toBeTruthy();
            expect(cvBtn).toBeTruthy();
        });

        it('should call abrirEnlace when clicking social buttons', () => {
            spyOn(component, 'abrirEnlace');

            const linkedinBtn = fixture.debugElement.query(By.css('.linkedin-btn'));
            linkedinBtn.nativeElement.click();

            expect(component.abrirEnlace).toHaveBeenCalled();
        });

        it('should call descargarCV when clicking CV button', () => {
            spyOn(component, 'descargarCV');

            const cvBtn = fixture.debugElement.query(By.css('.cv-btn'));
            cvBtn.nativeElement.click();

            expect(component.descargarCV).toHaveBeenCalled();
        });
    });

    describe('Form Validation Integration', () => {
        beforeEach(() => {
            component.ngOnInit();
            component.editarPerfil();
            fixture.detectChanges();
        });

        it('should show validation errors for empty required fields', () => {
            const nombreInput = fixture.debugElement.query(By.css('input[formControlName="nombre"]'));

            nombreInput.nativeElement.value = '';
            nombreInput.nativeElement.dispatchEvent(new Event('input'));
            nombreInput.nativeElement.blur();

            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('mat-error'));
            expect(errorMessage).toBeTruthy();
        });

        it('should validate email format', () => {
            const emailInput = fixture.debugElement.query(By.css('input[formControlName="email"]'));

            emailInput.nativeElement.value = 'invalid-email';
            emailInput.nativeElement.dispatchEvent(new Event('input'));
            emailInput.nativeElement.blur();

            fixture.detectChanges();

            const emailControl = component.editForm.get('email');
            expect(emailControl?.hasError('email')).toBe(true);
        });
    });

    describe('Responsive Design Integration', () => {
        it('should adapt layout for mobile view', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 600,
            });

            component.ngOnInit();
            fixture.detectChanges();

            const profileGrid = fixture.debugElement.query(By.css('.profile-grid'));
            expect(profileGrid).toBeTruthy();
        });
    });
});