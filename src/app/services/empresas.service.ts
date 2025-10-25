import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EmpresaDTO } from '../models/empresa.dto';
import { CompanySize } from '../models/usuario.dto';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {

  constructor(private authService: AuthService) { }

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
    const currentUser = this.authService.getCurrentUserFromCookie();
    if (!currentUser || currentUser.tipo !== 'empresa') {
      return of(null);
    }

    // Simular datos de la empresa loggeada
    const empresaLoggeada: EmpresaDTO = {
      id: currentUser.id,
      name: currentUser.nombre || 'Mi Empresa',
      surname: '',
      imageUrl: 'https://i.pravatar.cc/150?img=default',
      description: 'Descripción de mi empresa...',
      industry: 'Tecnología',
      size: CompanySize.FROM_51_TO_200,
      webSiteUrl: 'https://miempresa.com',
      email: currentUser.email,
      phone: '+54 11 1234-5678',
      location: 'Buenos Aires, Argentina',
      linkedinUrl: 'https://linkedin.com/company/miempresa',
      role: 'empresa'
    };

    return of(empresaLoggeada);
  }

  actualizarPerfil(datos: Partial<EmpresaDTO>): Observable<EmpresaDTO> {
    // Simular actualización del perfil
    const empresaActualizada: EmpresaDTO = {
      id: datos.id || 1,
      name: datos.name || 'Mi Empresa',
      surname: datos.surname || '',
      imageUrl: datos.imageUrl || 'https://i.pravatar.cc/150?img=default',
      description: datos.description || '',
      industry: datos.industry || '',
      size: datos.size || CompanySize.FROM_1_TO_10,
      webSiteUrl: datos.webSiteUrl || '',
      email: datos.email || '',
      phone: datos.phone || '',
      location: datos.location || '',
      linkedinUrl: datos.linkedinUrl || '',
      role: 'empresa'
    };

    return of(empresaActualizada);
  }
}
