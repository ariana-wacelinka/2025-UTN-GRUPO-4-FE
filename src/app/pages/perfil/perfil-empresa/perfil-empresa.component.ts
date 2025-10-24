import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EmpresasService } from '../../../services/empresas.service';
import { EmpresaDTO, ActualizarEmpresaDTO } from '../../../models/empresa.dto';

@Component({
    selector: 'app-perfil-empresa',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './perfil-empresa.component.html',
    styleUrls: ['./perfil-empresa.component.scss']
})
export class PerfilEmpresaComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Signals
    empresa = signal<EmpresaDTO | null>(null);
    isEditing = signal(false);
    isLoading = signal(false);
    selectedLogoFile = signal<File | null>(null);
    imagePreview = signal<string | null>(null);

    // Form
    editForm!: FormGroup;

    // Sectores disponibles
    sectoresDisponibles = [
        'Tecnología', 'Finanzas', 'Salud', 'Educación',
        'E-commerce', 'Consultoría', 'Marketing', 'Otro'
    ];

    // Tamaños disponibles
    tamaniosDisponibles = [
        'Startup', 'Pequeña', 'Mediana', 'Grande'
    ];

    // Computed properties
    headerData = computed(() => {
        const emp = this.empresa();
        if (!emp) return null;

        return {
            titulo: emp.nombre,
            subtitulo: emp.sector,
            descripcion: emp.descripcion,
            imagen: emp.logo
        };
    });

    contactInfo = computed(() => {
        const emp = this.empresa();
        if (!emp) return null;

        const items = [];
        if (emp.email) items.push({ icon: 'email', label: 'Email', value: emp.email });
        if (emp.telefono) items.push({ icon: 'phone', label: 'Teléfono', value: emp.telefono });
        if (emp.ubicacion) items.push({ icon: 'location_on', label: 'Ubicación', value: emp.ubicacion });
        if (emp.sitioWeb) items.push({ icon: 'language', label: 'Sitio Web', value: emp.sitioWeb });
        if (emp.fechaFundacion) items.push({ icon: 'event', label: 'Fundación', value: emp.fechaFundacion });
        if (emp.tamanio) items.push({ icon: 'business', label: 'Tamaño', value: emp.tamanio });

        return {
            title: 'Información de Contacto',
            icon: 'contact_mail',
            items
        };
    });

    socialLinksCompact = computed(() => {
        const emp = this.empresa();
        if (!emp?.redesSociales) return [];

        const links = [];
        if (emp.redesSociales.linkedin) {
            links.push({
                icon: 'business',
                label: 'LinkedIn',
                url: emp.redesSociales.linkedin
            });
        }
        if (emp.sitioWeb) {
            links.push({
                icon: 'language',
                label: 'Sitio Web',
                url: emp.sitioWeb
            });
        }

        return links;
    });

    constructor(
        private formBuilder: FormBuilder,
        private empresasService: EmpresasService,
        private snackBar: MatSnackBar
    ) {
        this.initializeForm();
    }

    private initializeForm() {
        this.editForm = this.formBuilder.group({
            nombre: ['', [Validators.required, Validators.minLength(2)]],
            descripcion: ['', [Validators.required, Validators.maxLength(500)]],
            sector: ['', [Validators.required]],
            tamanio: ['', [Validators.required]],
            fechaFundacion: [''],
            ubicacion: [''],
            telefono: [''],
            email: ['', [Validators.email]],
            sitioWeb: [''],
            redesSociales: this.formBuilder.group({
                linkedin: [''],
                facebook: [''],
                twitter: [''],
                instagram: ['']
            })
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
        this.isLoading.set(true);
        this.empresasService.getEmpresaActual()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (empresa) => {
                    this.empresa.set(empresa);
                    this.isLoading.set(false);
                },
                error: (error) => {
                    console.error('Error al cargar el perfil:', error);
                    this.isLoading.set(false);
                    this.snackBar.open('Error al cargar el perfil', 'Cerrar', { duration: 3000 });
                }
            });
    }

    getAvatarUrl(name: string): string {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=ffffff&size=150`;
    }

    // Eventos de archivos
    onLogoSelectedInternal(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            this.selectedLogoFile.set(file);

            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview.set(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            this.snackBar.open('Logo seleccionado', 'Cerrar', { duration: 2000 });
        }
    }

    // Edición del perfil
    editarPerfil() {
        const empresaActual = this.empresa();
        if (!empresaActual) return;

        this.isEditing.set(true);

        this.editForm.patchValue({
            nombre: empresaActual.nombre,
            descripcion: empresaActual.descripcion,
            sector: empresaActual.sector,
            tamanio: empresaActual.tamanio,
            fechaFundacion: empresaActual.fechaFundacion,
            ubicacion: empresaActual.ubicacion,
            telefono: empresaActual.telefono,
            email: empresaActual.email,
            sitioWeb: empresaActual.sitioWeb,
            redesSociales: {
                linkedin: empresaActual.redesSociales?.linkedin || '',
                facebook: empresaActual.redesSociales?.facebook || '',
                twitter: empresaActual.redesSociales?.twitter || '',
                instagram: empresaActual.redesSociales?.instagram || ''
            }
        });
    }

    cancelarEdicion() {
        this.isEditing.set(false);
        this.selectedLogoFile.set(null);
        this.imagePreview.set(null);
    }

    guardarCambios() {
        if (this.editForm.valid) {
            this.isLoading.set(true);

            const datosActualizados: ActualizarEmpresaDTO = this.editForm.value;

            this.empresasService.actualizarPerfil(datosActualizados)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (perfilActualizado) => {
                        this.empresa.set(perfilActualizado);
                        this.isEditing.set(false);
                        this.isLoading.set(false);
                        this.selectedLogoFile.set(null);
                        this.imagePreview.set(null);

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

    private markFormGroupTouched() {
        Object.keys(this.editForm.controls).forEach(key => {
            this.editForm.get(key)?.markAsTouched();
        });
    }

    // Getters para formularios
    get f() {
        return this.editForm.controls;
    }
}