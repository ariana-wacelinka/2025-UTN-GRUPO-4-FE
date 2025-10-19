import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { OfertaListaDTO, EstadoAplicacion, AplicacionDTO, CrearOfertaDTO } from '../models/oferta.dto';
import { AplicanteDTO, AplicanteListaDTO } from '../models/aplicante.dto';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class OfertasService {
  private ofertas: OfertaListaDTO[] = [];

  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {
    this.ofertas = this.getMockOfertas();
  }

  getOfertas(): Observable<OfertaListaDTO[]> {
    // TODO: Reemplazar con: return this.http.get<OfertaListaDTO[]>(`${this.apiUrl}/ofertas`);
    return of([...this.ofertas]);
  }

  getOfertaById(id: number): Observable<OfertaListaDTO | undefined> {
    // TODO: Reemplazar con: return this.http.get<OfertaListaDTO>(`${this.apiUrl}/ofertas/${id}`);
    return of(this.ofertas.find(o => o.id === id));
  }

  aplicarAOferta(aplicacion: AplicacionDTO): void {
    const oferta = this.ofertas.find(o => o.id === aplicacion.ofertaId);
    if (oferta) {
      oferta.estado = EstadoAplicacion.APLICADO;
      this.guardarAplicacion(aplicacion);
    }
  }

  private guardarAplicacion(aplicacion: AplicacionDTO): void {
    const appDto = {
      ofertaId: aplicacion.ofertaId,
      usuarioId: aplicacion.usuarioId,
      cartaPresentacion: aplicacion.cartaPresentacion || null
    };
    const contenido = JSON.stringify(appDto, null, 2);
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aplicacion_${aplicacion.ofertaId}_${aplicacion.usuarioId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getAplicantesPorOferta(ofertaId: number): Observable<AplicanteListaDTO> {
    // TODO: Reemplazar con: return this.http.get<AplicanteListaDTO>(`${this.apiUrl}/ofertas/${ofertaId}/aplicantes`);
    return of(this.getMockAplicantes(ofertaId)).pipe(delay(500));
  }

  crearOferta(oferta: CrearOfertaDTO): void {
    const nuevaOferta: OfertaListaDTO = {
      id: Math.max(...this.ofertas.map(o => o.id)) + 1,
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      requisitos: oferta.requisitos,
      modalidad: oferta.modalidad,
      locacion: oferta.locacion,
      pagoAprox: oferta.pagoAprox || '',
      atributos: oferta.atributos,
      estado: EstadoAplicacion.NO_APLICADO,
      empresa: { id: 1, nombre: 'Mi Empresa' }
    };
    
    this.ofertas.push(nuevaOferta);
    this.guardarOferta(nuevaOferta);
  }

  private guardarOferta(oferta: OfertaListaDTO): void {
    const contenido = JSON.stringify(oferta, null, 2);
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oferta_${oferta.id}_${oferta.titulo.replace(/\s/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  descargarCV(aplicante: AplicanteDTO): void {
    // Mock: generar archivo txt con datos del CV
    const contenido = `CURRICULUM VITAE

Nombre: ${aplicante.nombre}
Email: ${aplicante.email}
Carrera: ${aplicante.carrera || 'No especificada'}
Año de Ingreso: ${aplicante.anioIngreso || 'No especificado'}

--- Carta de Presentación ---
${aplicante.cartaPresentacion || 'No proporcionada'}

--- Información Adicional ---
Aplicó a oferta ID: ${aplicante.ofertaId}
Fecha de aplicación: ${aplicante.fechaAplicacion}
`;

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = aplicante.cvFileName || `CV_${aplicante.nombre.replace(/\s/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private getMockAplicantes(ofertaId: number): AplicanteListaDTO {
    const oferta = this.ofertas.find(o => o.id === ofertaId);
    const titulo = oferta?.titulo || 'Oferta no encontrada';

    const mockAplicantes: { [key: number]: AplicanteDTO[] } = {
      1: [
        {
          id: 1,
          usuarioId: 101,
          nombre: 'Ariana Wacelinka',
          email: 'wacelinka@example.com',
          carrera: 'Ingeniería en Sistemas',
          anioIngreso: 2020,
          cvUrl: '/assets/documents/WACELINKA, Ariana.pdf',
          cvFileName: 'WACELINKA_Ariana.pdf',
          cartaPresentacion: 'Me interesa mucho esta posición porque...',
          fechaAplicacion: '2025-09-15',
          ofertaId: 1
        },
        {
          id: 2,
          usuarioId: 102,
          nombre: 'Juan Pérez',
          email: 'jperez@example.com',
          carrera: 'Ingeniería en Sistemas',
          anioIngreso: 2019,
          cvFileName: 'PEREZ_Juan.pdf',
          cartaPresentacion: 'Tengo 3 años de experiencia en Angular...',
          fechaAplicacion: '2025-09-16',
          ofertaId: 1
        },
        {
          id: 3,
          usuarioId: 103,
          nombre: 'María González',
          email: 'mgonzalez@example.com',
          carrera: 'Ingeniería en Sistemas',
          anioIngreso: 2021,
          cvFileName: 'GONZALEZ_Maria.pdf',
          cartaPresentacion: 'Me apasiona el desarrollo full stack...',
          fechaAplicacion: '2025-09-17',
          ofertaId: 1
        }
      ],
      2: [
        {
          id: 4,
          usuarioId: 104,
          nombre: 'Carlos Rodríguez',
          email: 'crodriguez@example.com',
          carrera: 'Ingeniería en Sistemas',
          anioIngreso: 2020,
          cvFileName: 'RODRIGUEZ_Carlos.pdf',
          cartaPresentacion: 'Especializado en React y frontend moderno...',
          fechaAplicacion: '2025-09-18',
          ofertaId: 2
        },
        {
          id: 5,
          usuarioId: 105,
          nombre: 'Laura Martínez',
          email: 'lmartinez@example.com',
          carrera: 'Ingeniería en Sistemas',
          anioIngreso: 2019,
          cvFileName: 'MARTINEZ_Laura.pdf',
          cartaPresentacion: 'Con experiencia en UI/UX y React...',
          fechaAplicacion: '2025-09-19',
          ofertaId: 2
        }
      ],
      3: [
        {
          id: 6,
          usuarioId: 106,
          nombre: 'Diego Fernández',
          email: 'dfernandez@example.com',
          carrera: 'Ingeniería en Sistemas',
          anioIngreso: 2018,
          cvFileName: 'FERNANDEZ_Diego.pdf',
          cartaPresentacion: '5 años de experiencia en Java y Spring Boot...',
          fechaAplicacion: '2025-09-20',
          ofertaId: 3
        }
      ]
    };

    const aplicantes = mockAplicantes[ofertaId] || [];

    return {
      ofertaId,
      ofertaTitulo: titulo,
      aplicantes,
      totalAplicantes: aplicantes.length
    };
  }

  private getMockOfertas(): OfertaListaDTO[] {
    return [
      {
        id: 1,
        titulo: 'Desarrollador Full Stack',
        descripcion: 'Buscamos un desarrollador full stack con experiencia en tecnologías modernas para unirse a nuestro equipo dinámico.',
        requisitos: 'Mínimo 3 años de experiencia en Angular y Node.js, conocimientos en bases de datos NoSQL.',
        modalidad: 'remoto',
        locacion: 'Buenos Aires, Argentina',
        pagoAprox: 'USD 2000-3000',
        atributos: ['Angular', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'AWS'],
        estado: EstadoAplicacion.NO_APLICADO,
        empresa: { id: 1, nombre: 'TechCorp Solutions' }
      },
      {
        id: 2,
        titulo: 'Frontend Developer',
        descripcion: 'Desarrollador frontend especializado en React para proyectos innovadores.',
        requisitos: '2+ años de experiencia en React, conocimientos en testing y metodologías ágiles.',
        modalidad: 'híbrido',
        locacion: 'Córdoba, Argentina',
        pagoAprox: 'USD 1500-2500',
        atributos: ['React', 'JavaScript', 'CSS', 'HTML'],
        estado: EstadoAplicacion.NO_APLICADO,
        empresa: { id: 2, nombre: 'InnovateWeb' }
      },
      {
        id: 3,
        titulo: 'Backend Developer Java',
        descripcion: 'Desarrollador backend con experiencia en Spring Boot y microservicios.',
        requisitos: '4+ años de experiencia en Java, Spring Boot, conocimientos en Docker y Kubernetes.',
        modalidad: 'presencial',
        locacion: 'Mendoza, Argentina',
        pagoAprox: 'USD 2500-3500',
        atributos: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Kubernetes'],
        estado: EstadoAplicacion.NO_APLICADO,
        empresa: { id: 3, nombre: 'Enterprise Systems' }
      }
    ];
  }
}