# Actualización: Navegación Inteligente por Rol de Usuario

## Descripción
Se ha implementado navegación inteligente que detecta el rol del usuario clickeado en el buscador y lo redirige al perfil correcto (estudiante u organización/empresa).

## Cambios Implementados

### 1. UsuariosSearchComponent
**Archivo:** `src/app/components/usuarios-search/usuarios-search.component.ts`

#### Método `verPerfil()` actualizado:
```typescript
verPerfil(usuario: UsuarioDTO): void {
  const role = usuario.role?.toLowerCase();
  
  if (role === 'organizacion' || role === 'organization' || role === 'empresa') {
    // Navegar al perfil de empresa
    this.router.navigate(['/perfil-empresa', usuario.id]);
  } else {
    // Por defecto, navegar al perfil de estudiante/alumno
    this.router.navigate(['/perfil', usuario.id]);
  }
}
```

#### Nuevos Métodos Auxiliares:

**getRoleIcon(role: string)**
- Retorna `'business'` para organizaciones
- Retorna `'person'` para estudiantes/otros

**getRoleLabel(role: string)**
- Retorna `'Empresa'` para organizaciones
- Retorna `'Estudiante'` para estudiantes
- Retorna el rol original para otros casos

**getRoleBadgeClass(role: string)**
- Retorna `'organizacion'` para empresas
- Retorna `'estudiante'` para estudiantes
- Retorna `'default'` para otros

#### UI Mejorada:
- Badge de rol visible en cada usuario de la lista
- Íconos diferentes según el tipo de usuario
- Colores distintivos para cada rol

#### Estilos CSS:
```scss
.role-badge.estudiante {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge.organizacion {
  background: #f3e5f5;
  color: #7b1fa2;
}
```

---

### 2. Rutas Actualizadas
**Archivo:** `src/app/app.routes.ts`

#### Nueva ruta agregada:
```typescript
{ path: 'perfil-empresa/:id', component: PerfilEmpresaComponent, canActivate: [authGuard] }
```

#### Rutas completas para perfiles:
```typescript
// Perfiles de Estudiantes
{ path: 'perfil', component: PerfilAlumnoComponent, canActivate: [authGuard] }
{ path: 'perfil/:id', component: PerfilAlumnoComponent, canActivate: [authGuard] }

// Perfiles de Empresas
{ path: 'perfil-empresa', component: PerfilEmpresaComponent, canActivate: [authGuard] }
{ path: 'perfil-empresa/:id', component: PerfilEmpresaComponent, canActivate: [authGuard] }
```

---

### 3. PerfilAlumnoComponent
**Archivo:** `src/app/pages/perfil/perfil-alumno/perfil-alumno.component.ts`

#### Método `cargarPerfil()` actualizado:
```typescript
private cargarPerfil() {
  this.isLoading.set(true);

  this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        // Primero intentar obtener de params de ruta (para /perfil/:id)
        let userId = params['id'];
        
        // Si no está en params de ruta, intentar query params (para compatibilidad)
        if (!userId) {
          userId = this.route.snapshot.queryParams['userId'];
        }
        
        return this.perfilService.getPerfil(userId);
      })
    )
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
}
```

#### Método `isOwnProfile()` actualizado:
```typescript
isOwnProfile(): boolean {
  // Verificar si estamos viendo el perfil propio
  return !this.route.snapshot.queryParams['userId'] && 
         !this.route.snapshot.params['id'];
}
```

---

### 4. PerfilEmpresaComponent
**Archivo:** `src/app/pages/perfil/perfil-empresa/perfil-empresa.component.ts`

#### Constructor actualizado:
- Agregado `ActivatedRoute` a las dependencias

#### Método `cargarPerfil()` actualizado:
```typescript
private cargarPerfil() {
  this.isLoading.set(true);
  
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
        this.snackBar.open('Error al cargar el perfil', 'Cerrar', { 
          duration: 3000 
        });
      }
    });
}
```

#### Nuevo método `isOwnProfile()`:
```typescript
isOwnProfile(): boolean {
  return !this.route.snapshot.params['id'];
}
```

---

### 5. EmpresasService
**Archivo:** `src/app/services/empresas.service.ts`

#### Nuevo método `getEmpresaPorId()`:
```typescript
getEmpresaPorId(empresaId?: number): Observable<EmpresaDTO | null> {
  if (empresaId) {
    // Si se proporciona un ID, buscar en los mocks
    const empresa = this.getMockEmpresas().find(e => e.id === empresaId);
    return of(empresa || null);
  }
  
  // Si no hay ID, devolver la empresa actual del usuario loggeado
  return this.getEmpresaActual();
}
```

---

## Flujo de Navegación

### 1. Usuario busca en el buscador
```
Usuario escribe "Juan" → Resultados muestran usuarios con badge de rol
```

### 2. Usuario hace clic en un resultado
```
Click → getRoleIcon() muestra ícono correcto
      → getRoleLabel() muestra badge "Estudiante" o "Empresa"
      → verPerfil(usuario) analiza el rol
```

### 3. Navegación según rol
```
Si role = "organizacion" | "organization" | "empresa"
  → router.navigate(['/perfil-empresa', usuario.id])
  → PerfilEmpresaComponent carga perfil con empresaId

Si role = "estudiante" | "student" | otros
  → router.navigate(['/perfil', usuario.id])
  → PerfilAlumnoComponent carga perfil con userId
```

### 4. Componente de perfil carga datos
```
PerfilAlumnoComponent
  → Lee params['id']
  → Llama perfilService.getPerfil(userId)
  → Muestra perfil del estudiante

PerfilEmpresaComponent
  → Lee params['id']
  → Llama empresasService.getEmpresaPorId(empresaId)
  → Muestra perfil de la empresa
```

---

## Compatibilidad con Código Existente

### Query Params
El código sigue soportando `?userId=X` en query params para compatibilidad con código existente:

```typescript
// Prioridad: params de ruta > query params
let userId = params['id'];
if (!userId) {
  userId = this.route.snapshot.queryParams['userId'];
}
```

### Método isOwnProfile()
Actualizado para verificar ambas fuentes:

```typescript
// Perfil propio = sin ID en params ni en query
return !this.route.snapshot.queryParams['userId'] && 
       !this.route.snapshot.params['id'];
```

---

## Roles Soportados

### Organizaciones/Empresas
- `organizacion`
- `organization`
- `empresa`

**Navegación:** `/perfil-empresa/:id`

### Estudiantes
- `estudiante`
- `student`
- Cualquier otro rol no listado arriba

**Navegación:** `/perfil/:id`

---

## Ejemplos de Uso

### Ejemplo 1: Ver perfil de empresa
```typescript
// Usuario con role = "organizacion" e id = 5
verPerfil(usuario) 
  → Navega a /perfil-empresa/5
  → PerfilEmpresaComponent carga datos de empresa ID 5
```

### Ejemplo 2: Ver perfil de estudiante
```typescript
// Usuario con role = "estudiante" e id = 123
verPerfil(usuario)
  → Navega a /perfil/123
  → PerfilAlumnoComponent carga datos de estudiante ID 123
```

### Ejemplo 3: Ver perfil propio
```typescript
// Sin params de ruta
/perfil → Carga perfil del usuario loggeado
/perfil-empresa → Carga perfil de la empresa loggeada
```

---

## Testing Sugerido

1. **Buscar un estudiante y hacer clic**
   - Verificar navegación a `/perfil/:id`
   - Verificar que se carga el perfil correcto

2. **Buscar una empresa y hacer clic**
   - Verificar navegación a `/perfil-empresa/:id`
   - Verificar que se carga el perfil correcto

3. **Verificar badges de rol**
   - Estudiantes muestran badge azul
   - Empresas muestran badge morado

4. **Verificar íconos**
   - Estudiantes muestran ícono `person`
   - Empresas muestran ícono `business`

5. **Verificar método isOwnProfile()**
   - Con ID en ruta → false
   - Sin ID en ruta → true

---

## Beneficios

✅ Navegación inteligente según tipo de usuario
✅ UI clara con badges y colores distintivos
✅ Compatibilidad con código existente
✅ Soporte para perfiles propios y de terceros
✅ Guards de autenticación en todas las rutas
✅ Código reutilizable y mantenible
