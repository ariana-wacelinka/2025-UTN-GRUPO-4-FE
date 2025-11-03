import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { EmpresasService } from '../../../services/empresas.service';
import { EmpresaDTO } from '../../../models/empresa.dto';
import { CompanySize } from '../../../models/usuario.dto';

// Importar componentes compartidos
import { ProfileHeaderComponent, ProfileHeaderData, SocialLink } from '../../../components/profile-header/profile-header.component';
import { InfoCardComponent, InfoCardData } from '../../../components/info-card/info-card.component';
import { EmpresaOfertasManagerComponent } from '../../../components/empresa-ofertas-manager/empresa-ofertas-manager.component';

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
        MatTabsModule,
        FormsModule,
        ReactiveFormsModule,
        ProfileHeaderComponent,
        InfoCardComponent,
        EmpresaOfertasManagerComponent
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

    // Sectores disponibles (actualizado para industrias)
    sectoresDisponibles = [
        'Tecnología', 'Finanzas', 'Salud', 'Educación',
        'E-commerce', 'Consultoría', 'Marketing', 'Manufactura',
        'Servicios', 'Retail', 'Otro'
    ];

    // Tamaños disponibles (usando enum del backend)
    tamaniosDisponibles = [
        { value: CompanySize.FROM_1_TO_10, label: '1-10 empleados' },
        { value: 'FROM_11_TO_50', label: '11-50 empleados' },
        { value: 'FROM_51_TO_200', label: '51-200 empleados' },
        { value: 'FROM_201_TO_500', label: '201-500 empleados' },
        { value: 'MORE_THAN_500', label: 'Más de 500 empleados' }
    ];

    // Computed properties para componentes compartidos
    profileHeaderData = computed((): ProfileHeaderData | null => {
        const emp = this.empresa();
        if (!emp) return null;

        return {
            name: emp.name,
            subtitle: emp.industry,
            description: emp.description,
            imageUrl: emp.imageUrl,
            showDownloadCV: false
        };
    });

    contactInfo = computed((): InfoCardData | null => {
        const emp = this.empresa();
        if (!emp) return null;

        const items = [];
        if (emp.email) items.push({ icon: 'email', label: 'Email', value: emp.email });
        if (emp.phone) items.push({ icon: 'phone', label: 'Teléfono', value: emp.phone });
        if (emp.location) items.push({ icon: 'location_on', label: 'Ubicación', value: emp.location });
        if (emp.webSiteUrl) items.push({ icon: 'language', label: 'Sitio Web', value: emp.webSiteUrl });
        if (emp.size) items.push({ icon: 'business', label: 'Tamaño', value: this.getSizeLabel(emp.size) });

        return {
            title: 'Información de Contacto',
            icon: 'contact_mail',
            items
        };
    });

    socialLinksCompact = computed((): SocialLink[] => {
        const emp = this.empresa();
        if (!emp) return [];

        const links: SocialLink[] = [];
        if (emp.linkedinUrl) {
            links.push({
                icon: 'business',
                label: 'LinkedIn',
                url: emp.linkedinUrl
            });
        }
        if (emp.webSiteUrl) {
            links.push({
                icon: 'language',
                label: 'Sitio Web',
                url: emp.webSiteUrl
            });
        }

        return links;
    });

    constructor(
        private formBuilder: FormBuilder,
        private empresasService: EmpresasService,
        private snackBar: MatSnackBar,
        private route: ActivatedRoute
    ) {
        this.initializeForm();
    }

    private initializeForm() {
        this.editForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            description: ['', [Validators.required, Validators.maxLength(500)]],
            industry: ['', [Validators.required]],
            size: ['', [Validators.required]],
            location: [''],
            phone: [''],
            email: ['', [Validators.email]],
            imageUrl: [''],
            webSiteUrl: [''],
            linkedinUrl: ['']
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

        // Verificar si hay un empresaId en los params de ruta
        this.route.params
            .pipe(
                takeUntil(this.destroy$),
                switchMap(params => {
                    const empresaId = params['id'] ? Number(params['id']) : undefined;
                    return this.empresasService.getEmpresaPorId(empresaId);
                })
            )
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

    getSizeLabel(size: string): string {
        const sizeOption = this.tamaniosDisponibles.find(t => t.value === size);
        return sizeOption?.label || size;
    }

    // Métodos de eventos de componentes compartidos
    onEditProfile() {
        const empresaActual = this.empresa();
        if (!empresaActual) return;

        this.isEditing.set(true);

        this.editForm.patchValue({
            name: empresaActual.name,
            description: empresaActual.description,
            industry: empresaActual.industry,
            size: empresaActual.size,
            location: empresaActual.location,
            phone: empresaActual.phone,
            email: empresaActual.email,
            imageUrl: empresaActual.imageUrl || '',
            webSiteUrl: empresaActual.webSiteUrl,
            linkedinUrl: empresaActual.linkedinUrl
        });
    }

    onCancelEdit() {
        this.isEditing.set(false);
        this.selectedLogoFile.set(null);
        this.imagePreview.set(null);
    }

    onImageSelected(file: File) {
        this.selectedLogoFile.set(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            this.imagePreview.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        this.snackBar.open('Logo seleccionado', 'Cerrar', { duration: 2000 });
    }

    onSaveChanges() {
        if (this.editForm.valid) {
            this.isLoading.set(true);

            const empresaActual = this.empresa();
            const datosActualizados: Partial<EmpresaDTO> = {
                ...this.editForm.value,
                id: empresaActual?.id
            };

            const selectedLogo = this.selectedLogoFile();
            if (selectedLogo) {
                // subir logo primero
                this.empresasService.subirImagenEmpresa(selectedLogo)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (perfilConLogo) => {
                            this.empresa.set(perfilConLogo);
                            this.imagePreview.set(perfilConLogo.imageUrl || null);
                            this.editForm.patchValue({ imageUrl: perfilConLogo.imageUrl || '' });

                            // luego actualizar el resto del perfil
                            this.finishUpdateEmpresa(datosActualizados);
                        },
                        error: (error) => {
                            console.error('Error al subir logo:', error);
                            this.isLoading.set(false);
                            this.snackBar.open('Error al subir el logo. Intenta nuevamente.', 'Cerrar', { duration: 3000 });
                        }
                    });
            } else {
                this.finishUpdateEmpresa(datosActualizados);
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    private finishUpdateEmpresa(datos: Partial<EmpresaDTO>) {
        this.empresasService.actualizarPerfil(datos)
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

    // Métodos de compatibilidad con el template existente
    editarPerfil() {
        this.onEditProfile();
    }

    cancelarEdicion() {
        this.onCancelEdit();
    }

    guardarCambios() {
        this.onSaveChanges();
    }

    onLogoSelectedInternal(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.onImageSelected(input.files[0]);
        }
    }

    /**
     * Verifica si el perfil que se está viendo es el propio
     */
    isOwnProfile(): boolean {
        return !this.route.snapshot.params['id'];
    }
}
