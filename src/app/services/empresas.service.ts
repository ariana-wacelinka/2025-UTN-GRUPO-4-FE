import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EmpresaDTO, ActualizarEmpresaDTO } from '../models/empresa.dto';
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
        nombre: 'TechCorp',
        logo: '🚀',
        descripcion: 'Líder en soluciones tecnológicas innovadoras',
        sector: 'Tecnología',
        tamanio: 'Grande',
        sitioWeb: 'https://techcorp.com'
      },
      {
        id: 2,
        nombre: 'InnovateLab',
        logo: '💡',
        descripcion: 'Startup enfocada en IA y Machine Learning',
        sector: 'Inteligencia Artificial',
        tamanio: 'Startup',
        sitioWeb: 'https://innovatelab.com'
      },
      {
        id: 3,
        nombre: 'DataSolutions',
        logo: '📊',
        descripcion: 'Especialistas en análisis de datos y Big Data',
        sector: 'Data Science',
        tamanio: 'Mediana',
        sitioWeb: 'https://datasolutions.com'
      },
      {
        id: 4,
        nombre: 'CloudFirst',
        logo: '☁️',
        descripcion: 'Servicios de cloud computing y DevOps',
        sector: 'Cloud Computing',
        tamanio: 'Mediana',
        sitioWeb: 'https://cloudfirst.com'
      },
      {
        id: 5,
        nombre: 'MobileTech',
        logo: '📱',
        descripcion: 'Desarrollo de aplicaciones móviles nativas',
        sector: 'Desarrollo Móvil',
        tamanio: 'Pequeña',
        sitioWeb: 'https://mobiletech.com'
      },
      {
        id: 6,
        nombre: 'CyberSecure',
        logo: '🔒',
        descripcion: 'Soluciones de ciberseguridad empresarial',
        sector: 'Ciberseguridad',
        tamanio: 'Grande',
        sitioWeb: 'https://cybersecure.com'
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
      nombre: currentUser.nombre || 'Mi Empresa',
      logo: '🏢',
      descripcion: 'Descripción de mi empresa...',
      sector: 'Tecnología',
      tamanio: 'Mediana',
      sitioWeb: 'https://miempresa.com',
      fechaFundacion: '2020-01-01',
      ubicacion: 'Buenos Aires, Argentina',
      telefono: '+54 11 1234-5678',
      email: currentUser.email,
      empleados: [],
      redesSociales: {
        linkedin: 'https://linkedin.com/company/miempresa'
      }
    };

    return of(empresaLoggeada);
  }

  actualizarPerfil(datos: ActualizarEmpresaDTO): Observable<EmpresaDTO> {
    // Simular actualización del perfil
    const empresaActualizada: EmpresaDTO = {
      id: 1,
      nombre: datos.nombre || 'Mi Empresa',
      logo: '🏢',
      descripcion: datos.descripcion || '',
      sector: datos.sector || '',
      tamanio: datos.tamanio || '',
      sitioWeb: datos.sitioWeb,
      fechaFundacion: datos.fechaFundacion,
      ubicacion: datos.ubicacion,
      telefono: datos.telefono,
      email: datos.email,
      empleados: [],
      redesSociales: datos.redesSociales
    };

    return of(empresaActualizada);
  }
}
