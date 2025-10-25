import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { OfertasListaComponent } from './pages/ofertas-lista/ofertas-lista.component';
import { OfertaDetalleComponent } from './pages/oferta-detalle/oferta-detalle.component';
import { PerfilAlumnoComponent } from './pages/perfil/perfil-alumno/perfil-alumno.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RegisterOrganizationComponent } from './pages/register-organization/register-organization.component';
import { AplicantesListaComponent } from './pages/aplicantes-lista/aplicantes-lista.component';
import { PublicarOfertaComponent } from './pages/publicar-oferta/publicar-oferta.component';
import { authGuard } from './guards/auth.guard';
import { organizationGuard } from './guards/organization.guard';
import { PerfilEmpresaComponent } from './pages/perfil/perfil-empresa/perfil-empresa.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-organization', component: RegisterOrganizationComponent },
  { path: 'ofertas', component: OfertasListaComponent, canActivate: [authGuard] },
  { path: 'oferta/:id', component: OfertaDetalleComponent, canActivate: [authGuard] },
  { path: 'oferta/:id/aplicantes', component: AplicantesListaComponent, canActivate: [authGuard, organizationGuard] },
  { path: 'publicar-oferta', component: PublicarOfertaComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilAlumnoComponent, canActivate: [authGuard] },
  { path: 'perfil-empresa', component: PerfilEmpresaComponent }
];
