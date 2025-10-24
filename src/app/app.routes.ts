import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { OfertasListaComponent } from './pages/ofertas-lista/ofertas-lista.component';
import { OfertaDetalleComponent } from './pages/oferta-detalle/oferta-detalle.component';
import { PerfilAlumnoComponent } from './pages/perfil/perfil-alumno/perfil-alumno.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AplicantesListaComponent } from './pages/aplicantes-lista/aplicantes-lista.component';
import { PerfilEmpresaComponent } from './pages/perfil/perfil-empresa/perfil-empresa.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'ofertas', component: OfertasListaComponent },
  { path: 'oferta/:id', component: OfertaDetalleComponent },
  { path: 'oferta/:id/aplicantes', component: AplicantesListaComponent },
  { path: 'perfil', component: PerfilAlumnoComponent },
  { path: 'perfil-empresa', component: PerfilEmpresaComponent }
];
