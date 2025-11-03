# Componentes de Búsqueda - Documentación

## Resumen
Se han implementado dos componentes de búsqueda independientes para cumplir con la historia de usuario:

> **Historia de Usuario:**
> "Yo como usuario quiero poder hacer búsquedas de usuarios y publicaciones para poder conectar con otros usuarios y encontrar ofertas"

## Componentes Creados

### 1. OfertasSearchComponent
**Ubicación:** `src/app/components/ofertas-search/ofertas-search.component.ts`

**Descripción:** Componente de búsqueda avanzada de ofertas laborales con filtros múltiples.

**Características:**
- ✅ Búsqueda por título de oferta
- ✅ Búsqueda por descripción
- ✅ Filtro por modalidad (Remoto, Híbrido, Presencial)
- ✅ Filtro por ubicación
- ✅ Filtro por pago estimado (mínimo)
- ✅ Filtro por ID de requisitos
- ✅ Filtro por ID de empresa (bidderId)
- ✅ Auto-búsqueda con debounce (500ms)
- ✅ Panel expandible/colapsable
- ✅ Botón de limpiar filtros

**Emisión de eventos:**
```typescript
@Output() search = new EventEmitter<OfertaSearchParams>();
```

**Uso:**
```html
<app-ofertas-search (search)="onSearch($event)"></app-ofertas-search>
```

---

### 2. UsuariosSearchComponent
**Ubicación:** `src/app/components/usuarios-search/usuarios-search.component.ts`

**Descripción:** Componente de búsqueda de usuarios por nombre y apellido.

**Características:**
- ✅ Búsqueda por nombre o apellido
- ✅ Auto-búsqueda con debounce (500ms)
- ✅ Mínimo 2 caracteres para iniciar búsqueda
- ✅ Lista de resultados clickeable
- ✅ Navegación al perfil del usuario seleccionado
- ✅ Estados de UI: inicial, cargando, resultados, vacío
- ✅ Información de paginación

**Navegación:**
Al hacer clic en un usuario, navega a `/perfil/:id`

**Uso:**
```html
<app-usuarios-search></app-usuarios-search>
```

---

### 3. BusquedaComponent (Página)
**Ubicación:** `src/app/pages/busqueda/busqueda.component.ts`

**Descripción:** Página principal que integra ambos buscadores en pestañas (tabs).

**Características:**
- ✅ Diseño con Material Tabs
- ✅ Pestaña "Ofertas Laborales" con búsqueda y resultados
- ✅ Pestaña "Usuarios" con búsqueda de personas
- ✅ Estados de carga y vacío
- ✅ Diseño responsive

**Ruta:** `/busqueda`

---

## Integración con Ofertas Lista

### Modificaciones en OfertasListaComponent
**Archivo:** `src/app/pages/ofertas-lista/ofertas-lista.component.ts`

**Cambios realizados:**
1. Importación del componente `OfertasSearchComponent`
2. Agregado del componente en el template
3. Implementación del método `onSearch(params)`
4. Refactorización de la carga de ofertas a método `loadOfertas()`

**Código:**
```typescript
onSearch(params: OfertaSearchParams): void {
  this.currentSearchParams = params;
  this.loadOfertas();
}

private loadOfertas(): void {
  this.ofertasService.getoffers(this.currentSearchParams).subscribe((page) => {
    this.ofertas = page.content;
  });
}
```

---

## Rutas Configuradas

**Archivo:** `src/app/app.routes.ts`

### Nuevas rutas:
```typescript
{ path: 'busqueda', component: BusquedaComponent, canActivate: [authGuard] },
{ path: 'perfil/:id', component: PerfilAlumnoComponent, canActivate: [authGuard] },
```

---

## Navbar Actualizado

**Archivo:** `src/app/components/navbar/navbar.component.ts`

**Cambios:**
- ✅ Agregado botón "Búsqueda" con ícono de lupa
- ✅ Implementado método `irBusqueda()`
- ✅ Estilos para botón con ícono

---

## Criterios de Aceptación Cumplidos

✅ **CA1:** Dos buscadores distintos
   - Buscador de ofertas laborales (OfertasSearchComponent)
   - Buscador de usuarios (UsuariosSearchComponent)

✅ **CA2:** Poder buscar por todos los atributos de publicación
   - title, description, requirements, modality, location, estimatedPayment, bidderId

✅ **CA3:** Poder buscar usuarios por nombre y apellido
   - Implementado en UsuariosSearchComponent usando el endpoint del backend

✅ **CA4:** Que apretar en publicación me lleve al detalle
   - Las tarjetas de ofertas son clickeables y navegan a `/oferta/:id`

✅ **CA5:** Que apretar en un usuario me lleve a su perfil
   - Los usuarios en la lista navegan a `/perfil/:id`

---

## Endpoints Utilizados

### Ofertas
```typescript
GET /api/offers
Parámetros opcionales:
- title: string
- description: string
- requirements: number
- modality: string
- location: string
- estimatedPayment: number
- bidderId: number
```

### Usuarios
```typescript
GET /api/users/search
Parámetros:
- search: string (nombre o apellido)
- pageable: { page: number, size: number, sort: string[] }
```

---

## Flujo de Usuario

### Búsqueda de Ofertas
1. Usuario navega a `/busqueda` o `/ofertas`
2. Completa filtros de búsqueda
3. Los resultados se actualizan automáticamente (debounce 500ms)
4. Hace clic en una tarjeta de oferta
5. Navega al detalle de la oferta

### Búsqueda de Usuarios
1. Usuario navega a `/busqueda`
2. Selecciona pestaña "Usuarios"
3. Escribe nombre o apellido (mínimo 2 caracteres)
4. Los resultados se muestran automáticamente
5. Hace clic en un usuario
6. Navega al perfil del usuario

---

## Diseño Responsive

Todos los componentes incluyen:
- Grid adaptativo
- Breakpoints para tablets y móviles
- Botones full-width en móvil
- Espaciado optimizado

---

## Próximas Mejoras Sugeridas

1. **Paginación en resultados de búsqueda**
   - Implementar controles de navegación entre páginas
   
2. **Guardado de filtros**
   - Persistir búsquedas en localStorage
   
3. **Filtros avanzados**
   - Búsqueda por atributos/tecnologías
   - Filtro por rango de fechas
   
4. **Historial de búsquedas**
   - Mostrar búsquedas recientes
   
5. **Sugerencias de búsqueda**
   - Autocompletado de términos comunes

---

## Notas Técnicas

- **Debounce:** 500ms para evitar múltiples llamadas al backend
- **Validación:** Búsqueda de usuarios requiere mínimo 2 caracteres
- **Guards:** Todas las rutas protegidas con `authGuard`
- **Standalone Components:** Todos los componentes son standalone
- **Material Design:** Uso de Angular Material para UI consistente
