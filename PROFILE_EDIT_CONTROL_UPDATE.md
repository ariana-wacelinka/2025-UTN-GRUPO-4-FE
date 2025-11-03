# Actualización: Control de Edición en Perfiles de Usuario

## Descripción
Se ha implementado control de permisos para que los usuarios solo puedan editar su propio perfil y ver información sensible únicamente en sus propios perfiles.

## Problema Identificado
Cuando un usuario navegaba a `/perfil/:id` para ver el perfil de otro usuario, podía:
- Ver el botón "Editar Perfil"
- Ver las ofertas a las que ese usuario aplicó
- Acceder a la opción de cargar materias (.xls/.xlsx)

## Solución Implementada

### 1. ProfileHeaderComponent - Control de Botón Editar
**Archivo:** `src/app/components/profile-header/profile-header.component.ts`

#### Nuevo Input `canEdit`:
```typescript
@Input() canEdit = true; // Controla si se puede editar el perfil
```

#### Template Actualizado:
```html
<button *ngIf="!isEditing() && canEdit"
        mat-raised-button
        color="primary"
        class="modern-button"
        (click)="editProfile.emit()">
  <mat-icon>edit</mat-icon>
  Editar Perfil
</button>
```

**Comportamiento:**
- Si `canEdit = true` → Muestra botón "Editar Perfil"
- Si `canEdit = false` → Oculta botón "Editar Perfil"

---

### 2. PerfilAlumnoComponent - Restricciones de Perfil

#### 2.1 Header con Control de Edición
**Archivo:** `src/app/pages/perfil/perfil-alumno/perfil-alumno.component.html`

```html
<app-profile-header 
  [data]="profileHeaderData()!" 
  [socialLinks]="socialLinksCompact()"
  [isEditing]="isEditing" 
  [imagePreview]="imagePreview" 
  [canEdit]="isOwnProfile()"
  (editProfile)="onEditProfile()" 
  (saveChanges)="onSaveChanges()" 
  (cancelEdit)="onCancelEdit()" 
  (downloadCV)="onDownloadCV()" 
  (imageSelected)="onImageSelected($event)">
</app-profile-header>
```

**Clave:** `[canEdit]="isOwnProfile()"`

#### 2.2 Sección de Materias - Solo Visible para Perfil Propio
**Archivo:** `src/app/pages/perfil/perfil-alumno/perfil-alumno.component.html`

```html
<!-- Solo mostrar opción de subir materias si es el perfil propio -->
<div class="subjects-upload" *ngIf="isOwnProfile()">
  <div class="upload-info">
    <mat-icon>upload_file</mat-icon>
    <div>
      <h4>Planilla de materias</h4>
      <p>Formato permitido: .xls o .xlsx (Alumnos Web)</p>
    </div>
  </div>
  <div class="upload-actions">
    <input type="file" #materiasInput accept=".xls , .xlsx"
        (change)="onMateriasFileSelected($event)" hidden>
    <button mat-stroked-button class="upload-btn" (click)="materiasInput.click()"
        [disabled]="isMateriasUploading">
      <mat-icon *ngIf="!isMateriasUploading">cloud_upload</mat-icon>
      <mat-icon *ngIf="isMateriasUploading" class="spin">autorenew</mat-icon>
      {{isMateriasUploading ? 'Subiendo...' : 'Subir .xls o .xlsx'}}
    </button>
  </div>
</div>
```

**Resultado:**
- ✅ **Perfil propio** → Muestra botón "Subir .xls o .xlsx"
- ❌ **Perfil de otro** → Oculta botón de carga
- ✅ **Ambos casos** → Pueden ver las materias ya cargadas

#### 2.3 Ofertas Aplicadas - Solo para Perfil Propio
**Archivo:** `src/app/pages/perfil/perfil-alumno/perfil-alumno.component.ts`

**Método `cargarOfertasAplicadas()` actualizado:**
```typescript
private cargarOfertasAplicadas() {
  // Solo cargar si es el perfil del usuario actual
  if (!this.isOwnProfile()) {
    return; // No cargar ofertas si es perfil de otro usuario
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
        this.ofertasError = 'No pudimos cargar tus aplicaciones.';
      }
    });
}
```

**En HTML:**
```html
<!-- Solo se muestra si isOwnProfile() es true -->
<mat-card class="modern-card applied-offers-card" *ngIf="isOwnProfile()">
  <mat-card-header>
    <mat-card-title class="section-title">
      <mat-icon class="section-icon">work_outline</mat-icon>
      Mis Aplicaciones
      <span class="applications-count" *ngIf="totalOfertasAplicadas > 0">
        ({{totalOfertasAplicadas}})
      </span>
    </mat-card-title>
  </mat-card-header>
  <!-- Contenido de ofertas aplicadas -->
</mat-card>
```

#### 2.4 Ofertas Publicadas - Solo para Perfil Propio
**Método `cargarOfertasPublicadas()` actualizado:**
```typescript
private cargarOfertasPublicadas() {
  // Solo cargar si es el perfil del usuario actual
  if (!this.isOwnProfile()) {
    return; // No cargar ofertas si es perfil de otro usuario
  }

  this.isOfertasPublicadasLoading = true;
  this.authService.getCurrentUserId().pipe(
    takeUntil(this.destroy$),
    switchMap(currentUserId =>
      this.ofertasService.getoffers({ bidderId: currentUserId })
    )
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
      this.ofertasPublicadasError = 'No pudimos cargar tus publicaciones.';
    }
  });
}
```

---

### 3. PerfilEmpresaComponent - Control de Edición

**Archivo:** `src/app/pages/perfil/perfil-empresa/perfil-empresa.component.html`

```html
<app-profile-header 
  [data]="profileHeaderData()!" 
  [socialLinks]="socialLinksCompact()" 
  [isEditing]="isEditing"
  [imagePreview]="imagePreview" 
  [canEdit]="isOwnProfile()" 
  (editProfile)="onEditProfile()" 
  (saveChanges)="onSaveChanges()" 
  (cancelEdit)="onCancelEdit()" 
  (imageSelected)="onImageSelected($event)">
</app-profile-header>
```

**Método `isOwnProfile()` ya existente:**
```typescript
isOwnProfile(): boolean {
  return !this.route.snapshot.params['id'];
}
```

---

## Método `isOwnProfile()` - Lógica Central

**Implementación en PerfilAlumnoComponent:**
```typescript
isOwnProfile(): boolean {
  // Verificar si estamos viendo el perfil propio
  // Sin userId en query params ni en params de ruta
  return !this.route.snapshot.queryParams['userId'] && 
         !this.route.snapshot.params['id'];
}
```

**Lógica:**
- ✅ `/perfil` → `true` (perfil propio)
- ❌ `/perfil/123` → `false` (perfil de otro usuario)
- ❌ `/perfil?userId=123` → `false` (perfil de otro usuario - compatibilidad)

---

## Flujos de Usuario

### Caso 1: Usuario ve su propio perfil
**URL:** `/perfil`

**Permisos:**
- ✅ Ver información personal
- ✅ Botón "Editar Perfil" visible
- ✅ Cargar materias (.xls/.xlsx)
- ✅ Ver ofertas aplicadas
- ✅ Ver ofertas publicadas
- ✅ Editar toda la información

### Caso 2: Usuario ve perfil de otro estudiante
**URL:** `/perfil/456`

**Permisos:**
- ✅ Ver información personal del otro usuario
- ✅ Ver materias ya cargadas del otro usuario
- ✅ Ver habilidades, idiomas, educación
- ❌ Botón "Editar Perfil" oculto
- ❌ NO puede cargar materias
- ❌ NO ve ofertas aplicadas del otro usuario
- ❌ NO ve ofertas publicadas del otro usuario
- ❌ NO puede editar nada

### Caso 3: Usuario ve perfil de empresa propia
**URL:** `/perfil-empresa`

**Permisos:**
- ✅ Ver información de la empresa
- ✅ Botón "Editar Perfil" visible
- ✅ Editar toda la información

### Caso 4: Usuario ve perfil de otra empresa
**URL:** `/perfil-empresa/789`

**Permisos:**
- ✅ Ver información de la empresa
- ❌ Botón "Editar Perfil" oculto
- ❌ NO puede editar nada

---

## Información Visible vs. Oculta

### Información SIEMPRE Visible (Pública)
- ✅ Nombre y apellido
- ✅ Foto de perfil
- ✅ Descripción/Bio
- ✅ Ubicación
- ✅ Carrera y año (estudiantes)
- ✅ Institución educativa
- ✅ Habilidades/Skills
- ✅ Idiomas
- ✅ Materias aprobadas (solo lectura)
- ✅ Enlaces sociales (LinkedIn, GitHub)
- ✅ CV (descarga si está disponible)

### Información PRIVADA (Solo Perfil Propio)
- 🔒 Ofertas a las que aplicó
- 🔒 Estado de las aplicaciones
- 🔒 Cartas de presentación personalizadas
- 🔒 Ofertas que publicó
- 🔒 Botón para cargar materias
- 🔒 Botones de edición de perfil

---

## Beneficios de Seguridad

1. **Privacidad de Aplicaciones:**
   - Los usuarios no pueden ver a qué ofertas aplicaron otros
   - Protege la estrategia de búsqueda laboral de cada usuario

2. **Control de Edición:**
   - Solo el dueño del perfil puede editarlo
   - Previene modificaciones no autorizadas

3. **Información Profesional Pública:**
   - Mantiene visible la información profesional relevante
   - Facilita networking y reclutamiento

4. **Datos Sensibles Protegidos:**
   - Cartas de presentación privadas
   - Estado de aplicaciones privado
   - Publicaciones propias privadas

---

## Testing Sugerido

### Test 1: Ver Perfil Propio
1. Navegar a `/perfil`
2. ✅ Verificar que aparece botón "Editar Perfil"
3. ✅ Verificar que aparece sección "Mis Aplicaciones"
4. ✅ Verificar que aparece botón "Subir .xls o .xlsx"
5. ✅ Verificar que se puede editar el perfil

### Test 2: Ver Perfil de Otro Usuario
1. Navegar a `/perfil/123` (ID de otro usuario)
2. ✅ Verificar que información pública es visible
3. ❌ Verificar que NO aparece botón "Editar Perfil"
4. ❌ Verificar que NO aparece sección "Mis Aplicaciones"
5. ❌ Verificar que NO aparece botón "Subir .xls o .xlsx"
6. ✅ Verificar que materias existentes son visibles (solo lectura)

### Test 3: Ver Perfil de Empresa Propia
1. Navegar a `/perfil-empresa` (como empresa)
2. ✅ Verificar que aparece botón "Editar Perfil"
3. ✅ Verificar que se puede editar información

### Test 4: Ver Perfil de Otra Empresa
1. Navegar a `/perfil-empresa/456` (ID de otra empresa)
2. ✅ Verificar que información es visible
3. ❌ Verificar que NO aparece botón "Editar Perfil"

---

## Compatibilidad

✅ Mantiene compatibilidad con `?userId=X` en query params
✅ No rompe funcionalidad existente
✅ Los cambios son retrocompatibles
✅ Funciona con rutas existentes
