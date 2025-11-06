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
    return of(this.getMockEmpresas());
  }

  private getMockEmpresas(): EmpresaDTO[] {
    return [
      {
        id: 1,
        name: 'TechCorp',
        surname: '',
        imageUrl: 'https://i.pravatar.cc/150?img=1',
        description: 'Líder en soluciones tecnológicas innovadoras',
        industry: 'Tecnología',
        size: CompanySize.FROM_201_TO_500,
        webSiteUrl: 'https://techcorp.com',
        email: 'info@techcorp.com',
        phone: '+54 11 1234-5678',
        location: 'Buenos Aires, Argentina',
        linkedinUrl: 'https://linkedin.com/company/techcorp',
        role: 'empresa'
      },
      {
        id: 2,
        name: 'InnovateLab',
        surname: '',
        imageUrl: 'https://i.pravatar.cc/150?img=2',
        description: 'Startup enfocada en IA y Machine Learning',
        industry: 'Inteligencia Artificial',
        size: CompanySize.FROM_1_TO_10,
        webSiteUrl: 'https://innovatelab.com',
        email: 'contact@innovatelab.com',
        phone: '+54 11 2345-6789',
        location: 'Córdoba, Argentina',
        linkedinUrl: 'https://linkedin.com/company/innovatelab',
        role: 'empresa'
      },
      {
        id: 3,
        name: 'DataSolutions',
        surname: '',
        imageUrl: 'https://i.pravatar.cc/150?img=3',
        description: 'Especialistas en análisis de datos y Big Data',
        industry: 'Data Science',
        size: CompanySize.FROM_51_TO_200,
        webSiteUrl: 'https://datasolutions.com',
        email: 'hello@datasolutions.com',
        phone: '+54 11 3456-7890',
        location: 'Rosario, Argentina',
        linkedinUrl: 'https://linkedin.com/company/datasolutions',
        role: 'empresa'
      },
      {
        id: 4,
        name: 'CloudFirst',
        surname: '',
        imageUrl: 'https://i.pravatar.cc/150?img=4',
        description: 'Servicios de cloud computing y DevOps',
        industry: 'Cloud Computing',
        size: CompanySize.FROM_51_TO_200,
        webSiteUrl: 'https://cloudfirst.com',
        email: 'info@cloudfirst.com',
        phone: '+54 11 4567-8901',
        location: 'La Plata, Argentina',
        linkedinUrl: 'https://linkedin.com/company/cloudfirst',
        role: 'empresa'
      },
      {
        id: 5,
        name: 'MobileTech',
        surname: '',
        imageUrl: 'https://i.pravatar.cc/150?img=5',
        description: 'Desarrollo de aplicaciones móviles nativas',
        industry: 'Desarrollo Móvil',
        size: CompanySize.FROM_11_TO_50,
        webSiteUrl: 'https://mobiletech.com',
        email: 'team@mobiletech.com',
        phone: '+54 11 5678-9012',
        location: 'Mendoza, Argentina',
        linkedinUrl: 'https://linkedin.com/company/mobiletech',
        role: 'empresa'
      },
      {
        id: 6,
        name: 'CyberSecure',
        surname: '',
        imageUrl: 'https://i.pravatar.cc/150?img=6',
        description: 'Soluciones de ciberseguridad empresarial',
        industry: 'Ciberseguridad',
        size: CompanySize.FROM_201_TO_500,
        webSiteUrl: 'https://cybersecure.com',
        email: 'security@cybersecure.com',
        phone: '+54 11 6789-0123',
        location: 'San Miguel de Tucumán, Argentina',
        linkedinUrl: 'https://linkedin.com/company/cybersecure',
        role: 'empresa'
      }
    ];
  }

  getEmpresaActual(): Observable<EmpresaDTO | null> {
    // Check if user is logged in and is a company (organization)
    if (!this.authService.isLoggedIn() || !this.authService.isEmpresa()) {
      return of(null);
    }

    // Simular datos de la empresa loggeada
    const keycloakUser = this.authService.keycloakUser;
    const empresaLoggeada: EmpresaDTO = {
      id: keycloakUser?.id || 1,
      name: keycloakUser?.name || 'Mi Empresa',
      surname: keycloakUser?.surname || '',
      imageUrl: keycloakUser?.imageUrl || 'https://i.pravatar.cc/150?img=default',
      description: keycloakUser?.description || 'Descripción de mi empresa...',
      industry: 'Tecnología',
      size: CompanySize.FROM_51_TO_200,
      webSiteUrl: 'https://miempresa.com',
      email: keycloakUser?.email || 'empresa@example.com',
      phone: keycloakUser?.phone || '+54 11 1234-5678',
      location: keycloakUser?.location || 'Buenos Aires, Argentina',
      linkedinUrl: keycloakUser?.linkedinUrl || 'https://linkedin.com/company/miempresa',
      role: 'empresa'
    };

    return of(empresaLoggeada);
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
}
