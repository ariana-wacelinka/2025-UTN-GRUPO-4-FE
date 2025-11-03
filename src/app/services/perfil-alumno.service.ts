import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_URL } from '../app.config';
import { EstudianteDTO, ActualizarEstudianteDTO, IdiomaDTO } from '../models/aplicante.dto';
import { AuthService } from './auth.service';
import { P } from '@angular/cdk/keycodes';

export interface MateriaDTO {
    codigo?: string;
    nombre: string;
    nota: number;
    estado: string;
    fechaAprobacion: string;
    creditos?: number;
}

export interface MateriasState {
    materias: MateriaDTO[];
    promedioGeneral: number;
    totalMaterias: number;
}

export const DEFAULT_MATERIAS_STATE: MateriasState = {
    materias: [
        {
            codigo: '7510',
            nombre: 'Algoritmos y Estructuras de Datos',
            nota: 9,
            estado: 'Aprobada',
            fechaAprobacion: '2023-07-18',
            creditos: 8
        },
        {
            codigo: '7511',
            nombre: 'Arquitectura de Computadoras',
            nota: 8,
            estado: 'Aprobada',
            fechaAprobacion: '2023-12-05',
            creditos: 6
        },
        {
            codigo: '7512',
            nombre: 'Metodologías Ágiles',
            nota: 10,
            estado: 'Promocionada',
            fechaAprobacion: '2024-06-30',
            creditos: 4
        },
        {
            codigo: '7513',
            nombre: 'Bases de Datos',
            nota: 7,
            estado: 'Aprobada',
            fechaAprobacion: '2024-07-12',
            creditos: 6
        }
    ],
    promedioGeneral: 8.5,
    totalMaterias: 4
};

@Injectable({
  providedIn: 'root',
})
export class PerfilAlumnoService {
  private perfilSubject = new BehaviorSubject<EstudianteDTO | null>(null);
  public perfil$ = this.perfilSubject.asObservable();
  private materiasSubject = new BehaviorSubject<MateriasState>(
    DEFAULT_MATERIAS_STATE
  );
  public materias$ = this.materiasSubject.asObservable();
  authService = inject(AuthService);

  private readonly materiasEndpoint: string;

  private mockPerfil: EstudianteDTO = {
    id: 1,
    name: 'Ariana',
    surname: 'Wacelinka',
    imageUrl:
      'https://tse2.mm.bing.net/th/id/OIP.5CC9Agv_WNLAAwLXTaSzGAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
    email: 'arianawacelinka@alu.frlp.utn.edu.ar',
    phone: '+54 9 221 3199796',
    location: 'La Plata, Buenos Aires',
    linkedinUrl: 'https://www.linkedin.com/in/ariana-wacelinka-652a70208/',
    description:
      'Estudiante apasionada por el desarrollo de software con experiencia en proyectos académicos y personales. Me especializo en desarrollo web full-stack y tengo particular interés en UX/UI y tecnologías emergentes.',
    role: 'estudiante',
    career: 'Ingenieria en sistemas de informacion',
    currentYearLevel: 4,
    institution:
      'Universidad Tecnologica Nacional - Facultad Regional La Plata',
    skills: [
      'JavaScript',
      'TypeScript',
      'Angular',
      'React',
      'Node.js',
      'Python',
      'Java',
      'MySQL',
      'MongoDB',
      'Git',
      'Docker',
    ],
    languages: [
      { id: 1, name: 'Español', level: 5 },
      { id: 2, name: 'Inglés', level: 4 },
    ],
    subjects: [],
    cvUrl: '/assets/documents/WACELINKA, Ariana.pdf',
    cvFileName: 'WACELINKA_Ariana.pdf',
    githubUrl: 'https://github.com/ariana-wacelinka/',
    incomeDate: '2022-03-01',
    dateOfBirth: '2002-03-15',
    coverLetter: 'Estudiante apasionada por el desarrollo full-stack.',
  };

  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {
    this.perfilSubject.next(this.mockPerfil);
    this.materiasEndpoint = `${this.apiUrl}/students/profile/subjects`;
  }

  getPerfil(userId: any): Observable<EstudianteDTO> {
    //return of({ ...this.mockPerfil });
    const id = userId ? userId : this.authService.keycloakUser?.id;
    return this.http
      .get<EstudianteDTO>(`${this.apiUrl}/students/${id}`)
      .pipe(tap((response) => this.perfilSubject.next(response)));
  }

  actualizarPerfil(
    datosActualizados: ActualizarEstudianteDTO
  ): Observable<EstudianteDTO> {
    const id = this.authService.keycloakUser?.id;
    if (!id) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    return this.http
      .patch<EstudianteDTO>(`${this.apiUrl}/students/${id}`, datosActualizados)
      .pipe(
        tap((response) => this.perfilSubject.next(response)),
        catchError((error) => {
          console.error('Error al actualizar perfil:', error);
          return throwError(() => error);
        })
      );
  }

  subirImagenPerfil(archivo: File): Observable<{ imageUrl: string }> {
    const mockImageUrl = 'https://via.placeholder.com/300x300';
    this.mockPerfil.imageUrl = mockImageUrl;
    this.perfilSubject.next(this.mockPerfil);

    return of({ imageUrl: mockImageUrl });
  }

  subirCV(archivo: File): Observable<EstudianteDTO> {
    const id = this.authService.keycloakUser?.id;
    if (!id) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const formData = new FormData();
    formData.append('file', archivo);

    return this.http
      .post<EstudianteDTO>(`${this.apiUrl}/students/${id}/upload-cv`, formData)
      .pipe(
        tap((response) => {
          // devolver la URL del CV actualizado
          console.log('Respuesta del cv:', response);
          return response;
        }),
        catchError((error) => {
          console.error('Error al subir CV:', error);
          return throwError(() => error);
        })
      );
  }

  descargarCV(): void {
    const perfil = this.perfilSubject.value;
    if (!perfil?.cvUrl) {
      console.error('No hay URL de curriculum disponible');
      return;
    }

    const link = document.createElement('a');
    link.href = perfil.cvUrl;
    link.download = `CV_${perfil.name}_${perfil.surname}.pdf`;
    link.target = '_blank';

    if (perfil.cvUrl.startsWith('http')) {
      window.open(perfil.cvUrl, '_blank');
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  actualizarHabilidades(habilidades: string[]): Observable<EstudianteDTO> {
    this.mockPerfil.skills = [...habilidades];
    this.perfilSubject.next(this.mockPerfil);

    return of(this.mockPerfil);
  }

  actualizarIdiomas(idiomas: IdiomaDTO[]): Observable<EstudianteDTO> {
    this.mockPerfil.languages = [...idiomas];
    this.perfilSubject.next(this.mockPerfil);

    return of(this.mockPerfil);
  }

  eliminarPerfil(): Observable<{ success: boolean }> {
    this.perfilSubject.next(null);
    return of({ success: true });
  }

  obtenerMateriasState(): Observable<MateriasState> {
    return this.materias$;
  }

  cargarMateriasDesdeBackend(): Observable<MateriasState> {
    return this.http.get<MateriasState>(this.materiasEndpoint).pipe(
      tap((response) => this.setMateriasState(response)),
      catchError((error) => {
        console.error('Error al cargar materias:', error);
        this.setMateriasState(DEFAULT_MATERIAS_STATE);
        return of(DEFAULT_MATERIAS_STATE);
      })
    );
  }

  subirMateriasExcel(archivo: File): Observable<MateriasState> {
    const formData = new FormData();
    formData.append('file', archivo);

    return this.http
      .post<MateriasState>(`${this.materiasEndpoint}/upload`, formData)
      .pipe(
        tap((response) => this.setMateriasState(response)),
        catchError((error) => {
          console.error('Error al subir materias:', error);
          return throwError(() => error);
        })
      );
  }

  private setMateriasState(state: MateriasState) {
    const materias = state.materias
      ? state.materias.map((materia) => ({ ...materia }))
      : [];
    const promedioCalculado = this.calcularPromedio(materias);
    const promedio = Number(
      (state.promedioGeneral ?? promedioCalculado).toFixed(2)
    );
    const total = state.totalMaterias ?? materias.length;

    this.materiasSubject.next({
      materias,
      promedioGeneral: promedio,
      totalMaterias: total,
    });
  }

  private calcularPromedio(materias: MateriaDTO[]): number {
    if (!materias.length) {
      return 0;
    }

    const suma = materias
      .map((materia) => materia.nota)
      .filter((nota) => typeof nota === 'number' && !Number.isNaN(nota))
      .reduce((acc, nota) => acc + nota, 0);

    const cantidadNotas = materias.filter(
      (materia) =>
        typeof materia.nota === 'number' && !Number.isNaN(materia.nota)
    ).length;

    return cantidadNotas ? suma / cantidadNotas : 0;
  }

  getOfertasAplicadas(): Observable<PagedOfertasAplicadasResponse> {
    const studentId = this.authService.keycloakUser?.id;
    if (!studentId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    return this.http
      .get<PagedOfertasAplicadasResponse>(
        `${this.apiUrl}/applies?studentId=${studentId}`
      )
      .pipe(
        tap((response) => {
          console.log('Respuesta del backend:', response);
        }),
        catchError((error) => {
          console.error('Error al obtener ofertas aplicadas:', error);
          return throwError(() => error);
        })
      );
  }

  retirarAplicacion(applicationId: number): Observable<void> {
    const studentId = this.authService.keycloakUser?.id;
    if (!studentId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    return this.http
      .delete<void>(`${this.apiUrl}/applies/${applicationId}`)
      .pipe(
        tap(() => {
          console.log('Aplicación retirada con éxito');
        }),
        catchError((error) => {
          console.error('Error al retirar aplicación:', error);
          return throwError(() => error);
        })
      );
  }

}

// Interfaces para la respuesta de ofertas aplicadas
export interface OfertaAplicada {
    id: number;
    customCoverLetter: string;
    applicationDate?: string; // Fecha de aplicación
    status?: ApplicationStatus; // Estado de la aplicación
    offer?: OfferDetails;
}

export interface OfferDetails {
    id: number;
    title: string;
    description: string;
    requirements?: string; // Requisitos de la oferta
    modality: string;
    location: string;
    estimatedPayment: string;
    company?: CompanyInfo; // Información de la empresa
    tags?: string[]; // Tags/categorías de la oferta
    createdDate?: string; // Fecha de creación de la oferta
    expirationDate?: string; // Fecha de vencimiento
    isActive?: boolean; // Si la oferta está activa
}

export interface CompanyInfo {
    id: number;
    name: string;
    industry?: string;
    imageUrl?: string;
    description?: string;
}

export enum ApplicationStatus {
    PENDING = 'PENDING', // Pendiente de revisión
    REVIEWED = 'REVIEWED', // Revisada por la empresa
    ACCEPTED = 'ACCEPTED', // Aceptada
    REJECTED = 'REJECTED', // Rechazada
    WITHDRAWN = 'WITHDRAWN' // Retirada por el estudiante
}

export interface SortInfo {
    direction: string;
    nullHandling: string;
    ascending: boolean;
    property: string;
    ignoreCase: boolean;
}

export interface Pageable {
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: SortInfo[];
    unpaged: boolean;
}

export interface PagedOfertasAplicadasResponse {
    totalPages: number;
    totalElements: number;
    pageable: Pageable;
    size: number;
    content: OfertaAplicada[];
    number: number;
    sort: SortInfo[];
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}
