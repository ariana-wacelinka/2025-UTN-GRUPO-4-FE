# Sprint - Login y Visualización de Aplicantes

## Qué se Implementó

### 1. Login de Usuarios (Ruta: `/login`)

**Criterios de Aceptación:**
- CA1: Campo de email
- CA2: Campo de contraseña
- CA3: Datos guardados en archivo txt (simulado con localStorage)
- CA14: Sesión guardada en cookie

**Archivos Creados:**
- `src/app/pages/login/*` (componente completo)
- `src/app/services/auth.service.ts`

**Funcionalidad:**
- Validación de email y contraseña (mínimo 6 caracteres)
- Distinción automática: emails con "empresa" = tipo empresa, otros = tipo alumno
- Persistencia: cookie (7 días) + localStorage (historial)
- Redirección: empresas a `/ofertas`, alumnos a home

### 2. Visualización de Aplicantes (Ruta: `/oferta/:id/aplicantes`)

**Criterios de Aceptación:**
- CA1: Listado de personas que aplicaron
- CA2: Botón para descargar CV
- CA3: Nombre como link al perfil

**Archivos Creados:**
- `src/app/pages/aplicantes-lista/*` (componente completo)
- `src/app/models/aplicante.dto.ts`

**Archivos Modificados:**
- `src/app/services/ofertas.service.ts` (métodos para aplicantes y descarga CV)
- `src/app/components/navbar/navbar.component.ts` (botones login/logout)
- `src/app/app.routes.ts` (nuevas rutas)

**Funcionalidad:**
- Lista de aplicantes con datos completos
- Descarga de CV (archivo .txt simulado)
- Navegación a perfil del usuario
- Restricción: solo usuarios tipo empresa

---

## Inicio y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar proyecto
npm start

# URL: http://localhost:4200
```

---

## URLs para Testing

### Login
```
http://localhost:4200/login
```

**Credenciales:**
- Empresa: `empresa@techcorp.com` / `password123`
- Alumno: `alumno@frlp.utn.edu.ar` / `password123`
- Nota: Cualquier email con "empresa" = tipo empresa

### Aplicantes (requiere login como empresa)
```
http://localhost:4200/oferta/1/aplicantes  (3 aplicantes)
http://localhost:4200/oferta/2/aplicantes  (2 aplicantes)
http://localhost:4200/oferta/3/aplicantes  (1 aplicante)
```

---

## Inspección de Datos

### Cookie de Sesión
**DevTools > Application > Cookies > http://localhost:4200**
- Cookie: `userSession`
- Contiene: datos del usuario en JSON

```javascript
// Consola del navegador
const cookie = document.cookie.split(';').find(c => c.includes('userSession'));
const user = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
console.log(user);
```

### Historial de Logins
**DevTools > Application > Local Storage > http://localhost:4200**
- Clave: `login_history.txt`
- Contiene: array JSON con todos los logins

```javascript
// Consola del navegador
const history = JSON.parse(localStorage.getItem('login_history.txt'));
console.log(history);
```

---

## Próximos Pasos

### Integración Backend
1. Conectar `auth.service.ts` con `POST /api/auth/login`
2. Implementar JWT tokens
3. Conectar `ofertas.service.ts` con `GET /api/ofertas/:id/aplicantes`
4. Descarga real de CVs desde servidor

### Seguridad
1. Guards de autenticación en rutas
2. Interceptor HTTP para tokens
3. Hash de contraseñas server-side

### Funcionalidades
1. Registro de usuarios
2. Recuperación de contraseña
3. Filtros en lista de aplicantes

---

**Nota:** Este sprint NO incluye integración con backend. Todos los datos son simulados con mocks.
