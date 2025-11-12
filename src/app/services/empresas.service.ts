import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { EmpresaDTO } from '../models/empresa.dto';
import { CompanySize } from '../models/usuario.dto';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {
  private apiUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getEmpresas(): Observable<EmpresaDTO[]> {
    return this.http.get<EmpresaDTO[]>(`${this.apiUrl}/organizations`);
  }

  getEmpresaActual(): Observable<EmpresaDTO | null> {
    if (!this.authService.isLoggedIn() || !this.authService.isEmpresa()) {
      return of(null);
    }

    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => this.http.get<EmpresaDTO>(`${this.apiUrl}/organizations/${userId}`))
    );
  }

  /**
   * Obtiene el perfil de una empresa por ID
   * @param empresaId ID de la empresa (opcional, si no se proporciona usa el ID del usuario loggeado)
   */
  getEmpresaPorId(empresaId?: number): Observable<EmpresaDTO | null> {
    // Si se proporciona un ID, usarlo directamente
    if (empresaId) {
      return this.http.get<EmpresaDTO>(`${this.apiUrl}/organizations/${empresaId}`);
    }

    // Si no se proporciona ID, esperar a que el usuario esté cargado y usar su ID
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => this.http.get<EmpresaDTO>(`${this.apiUrl}/organizations/${userId}`))
    );
  }

  actualizarPerfil(datos: Partial<EmpresaDTO>): Observable<EmpresaDTO> {

    const body = {
      name: datos.name,
      surname: datos.surname,
      email: datos.email,
      phone: datos.phone,
      location: datos.location,
      description: datos.description,
      linkedinUrl: datos.linkedinUrl,
      webSiteUrl: datos.webSiteUrl,
      industry: datos.industry,
      size: datos.size
    };

    return this.authService
      .getCurrentUserId()
      .pipe(
        switchMap((userId) =>
          this.http.patch<EmpresaDTO>(`${this.apiUrl}/organizations/${userId}`, body)
        )
      );
  }

  /**
   * Sube la imagen/logo de la empresa al endpoint de usuarios y devuelve el perfil actualizado
   */
  subirImagenEmpresa(archivo: File): Observable<EmpresaDTO> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        const formData = new FormData();
        formData.append('file', archivo);
        return this.http.post<EmpresaDTO>(`${this.apiUrl}/users/${userId}/upload-image`, formData);
      })
    );
  }

  buscarEstudiantes(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/search`, {
      params: { 
        search: searchTerm,
        page: '0',
        size: '20'
      }
    });
  }


  vincularEstudiante(organizationId: number, studentId: number, recognitionType?: string): Observable<any> {
    const body = {
      studentId: studentId,
      recognitionType: recognitionType
    };
    return this.http.post(`${this.apiUrl}/organizations/${organizationId}/linked-students`, body);
  }


  obtenerEstudiantesVinculados(organizationId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/organizations/${organizationId}/linked-students`);
  }


  desvincularEstudiante(associationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/organizations/associations/${associationId}`);
  }
}
