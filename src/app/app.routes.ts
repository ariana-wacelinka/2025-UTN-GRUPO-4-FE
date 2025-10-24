import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { OfertasListaComponent } from './pages/ofertas-lista/ofertas-lista.component';
import { OfertaDetalleComponent } from './pages/oferta-detalle/oferta-detalle.component';
import { PerfilAlumnoComponent } from './pages/perfil-alumno/perfil-alumno.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RegisterOrganizationComponent } from './pages/register-organization/register-organization.component';
import { AplicantesListaComponent } from './pages/aplicantes-lista/aplicantes-lista.component';
import { PublicarOfertaComponent } from './pages/publicar-oferta/publicar-oferta.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-organization', component: RegisterOrganizationComponent },
  { path: 'ofertas', component: OfertasListaComponent },
  { path: 'oferta/:id', component: OfertaDetalleComponent },
  { path: 'oferta/:id/aplicantes', component: AplicantesListaComponent },
  { path: 'publicar-oferta', component: PublicarOfertaComponent },
  { path: 'perfil', component: PerfilAlumnoComponent }
];
