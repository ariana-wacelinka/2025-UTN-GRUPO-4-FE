import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { OfertasListaComponent } from './pages/ofertas-lista/ofertas-lista.component';
import { OfertaDetalleComponent } from './pages/oferta-detalle/oferta-detalle.component';
import { PerfilAlumnoComponent } from './pages/perfil-alumno/perfil-alumno.component';
import { LoginComponent } from './pages/login/login.component';
import { AplicantesListaComponent } from './pages/aplicantes-lista/aplicantes-lista.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'ofertas', component: OfertasListaComponent },
  { path: 'oferta/:id', component: OfertaDetalleComponent },
  { path: 'oferta/:id/aplicantes', component: AplicantesListaComponent },
  { path: 'perfil', component: PerfilAlumnoComponent }
];
