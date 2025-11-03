# Implementación de Componentes de Búsqueda

## Descripción
Implementación de la historia de usuario de búsqueda de usuarios y ofertas laborales, cumpliendo con todos los criterios de aceptación.

## Componentes Creados

### 1. OfertasSearchComponent
- **Archivo:** `src/app/components/ofertas-search/ofertas-search.component.ts`
- Buscador avanzado de ofertas con 7 filtros diferentes
- Auto-búsqueda con debounce de 500ms
- Panel expandible/colapsable
- Diseño responsive

### 2. UsuariosSearchComponent
- **Archivo:** `src/app/components/usuarios-search/usuarios-search.component.ts`
- Buscador de usuarios por nombre y apellido
- Navegación al perfil del usuario al hacer clic
- Estados visuales: inicial, cargando, resultados, vacío
- Integración con `UsuarioService.searchUsers()`

### 3. BusquedaComponent (Página)
- **Archivo:** `src/app/pages/busqueda/busqueda.component.ts`
- Página principal con pestañas (tabs)
- Integra ambos buscadores
- Muestra resultados de ofertas en grid
- Diseño con Angular Material

## Modificaciones a Componentes Existentes

### OfertasListaComponent
- **Archivo:** `src/app/pages/ofertas-lista/ofertas-lista.component.ts`
- Integración del `OfertasSearchComponent`
- Método `onSearch()` para manejar búsquedas
- Refactorización de carga de ofertas

### NavbarComponent
- **Archivo:** `src/app/components/navbar/navbar.component.ts`
- Agregado botón "Búsqueda" con ícono
- Método `irBusqueda()` para navegación

### Routes
- **Archivo:** `src/app/app.routes.ts`
- Nueva ruta: `/busqueda` → BusquedaComponent
- Nueva ruta: `/perfil/:id` → PerfilAlumnoComponent (para ver perfiles de otros usuarios)

## Servicios Utilizados

### offersService.getoffers()
```typescript
getoffers(params?: {
  title?: string;
  description?: string;
  requirements?: number;
  modality?: string;
  location?: string;
  estimatedPayment?: number;
  bidderId?: number;
}): Observable<PagedResponseDTO<OfertaListaDTO>>
```

### UsuarioService.searchUsers()
```typescript
searchUsers(
  search: string,
  pageNumber: number = 0,
  pageSize: number = 10,
  sort: string[] = []
): Observable<PagedUserSearchResponse>
```

## Criterios de Aceptación Cumplidos

✅ **CA1:** Pueden ser dos buscadores distintos
- Implementados: OfertasSearchComponent y UsuariosSearchComponent

✅ **CA2:** Poder buscar por todos los atributos de publicación
- Filtros: title, description, requirements, modality, location, estimatedPayment, bidderId

✅ **CA3:** Poder buscar usuarios por nombre y apellido
- Implementado con búsqueda en tiempo real

✅ **CA4:** Que apretar en publicación me lleve al detalle
- Las tarjetas de oferta son clickeables y navegan a `/oferta/:id`

✅ **CA5:** Que apretar en un usuario me lleve a su perfil
- Los usuarios de la lista navegan a `/perfil/:id`

## Características Técnicas

- **Debounce:** 500ms para optimizar llamadas al backend
- **Standalone Components:** Todos los nuevos componentes
- **Angular Material:** Diseño consistente con Material Design
- **Responsive Design:** Optimizado para móvil, tablet y desktop
- **TypeScript Strict:** Tipado fuerte en todos los componentes
- **Reactive Forms:** Para manejo de formularios de búsqueda

## Navegación

```
/busqueda
├── Tab: Ofertas Laborales
│   ├── Formulario de búsqueda
│   └── Grid de resultados → click → /oferta/:id
└── Tab: Usuarios
    ├── Buscador de usuarios
    └── Lista de resultados → click → /perfil/:id
```

## Pruebas Sugeridas

1. Navegar a `/busqueda`
2. Probar búsqueda de ofertas con diferentes filtros
3. Verificar que los resultados se actualizan automáticamente
4. Hacer clic en una oferta y verificar navegación
5. Cambiar a tab de usuarios
6. Buscar un usuario por nombre
7. Hacer clic en un usuario y verificar navegación al perfil

## Documentación

Se creó archivo de documentación detallada en:
`SEARCH_COMPONENTS_DOCUMENTATION.md`
