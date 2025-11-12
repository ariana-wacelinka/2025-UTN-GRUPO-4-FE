import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { API_URL } from '../app.config';
import { 
  EstudianteDTO, 
  ActualizarEstudianteDTO, 
  IdiomaDTO,
  WorkExperienceDTO,
  CreateWorkExperienceDTO,
  UpdateWorkExperienceDTO,
  PersonalProjectDTO,
  CreatePersonalProjectDTO,
  UpdatePersonalProjectDTO
} from '../models/aplicante.dto';
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

  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {
    this.materiasEndpoint = `${this.apiUrl}/students/profile/subjects`;
  }

  getPerfil(userId: any): Observable<EstudianteDTO> {
    //return of({ ...this.mockPerfil });

    // Si se proporciona userId, usarlo directamente
    if (userId) {
      return this.http
        .get<EstudianteDTO>(`${this.apiUrl}/students/${userId}`)
        .pipe(tap((response) => this.perfilSubject.next(response)));
    }

    // Si no hay userId, esperar a que el usuario esté cargado
    return this.authService.getCurrentUserId().pipe(
      switchMap(id =>
        this.http
          .get<EstudianteDTO>(`${this.apiUrl}/students/${id}`)
          .pipe(tap((response) => this.perfilSubject.next(response)))
      )
    );
  }

  actualizarPerfil(
    datosActualizados: ActualizarEstudianteDTO
  ): Observable<EstudianteDTO> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(id =>
        this.http
          .patch<EstudianteDTO>(`${this.apiUrl}/students/${id}`, datosActualizados)
          .pipe(
            tap((response) => this.perfilSubject.next(response)),
            catchError((error) => {
              console.error('Error al actualizar perfil:', error);
              return throwError(() => error);
            })
          )
      )
    );
  }

  subirImagenPerfil(archivo: File): Observable<EstudianteDTO> {
    // En el backend este endpoint devuelve el usuario actualizado con imageUrl
    return this.authService.getCurrentUserId().pipe(
      switchMap(id => {
        const formData = new FormData();
        formData.append('file', archivo);

        return this.http.post<EstudianteDTO>(`${this.apiUrl}/users/${id}/upload-image`, formData).pipe(
          tap(response => {
            // Actualizar el subject local con la respuesta del backend
            this.perfilSubject.next(response);
          }),
          catchError((error) => {
            console.error('Error al subir imagen de perfil:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  subirCV(archivo: File): Observable<EstudianteDTO> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(id => {
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
    // NOTA: Este método requiere endpoint del backend PUT /api/students/profile/skills
    // Cuando esté disponible, implementar la llamada HTTP correspondiente
    console.warn('actualizarHabilidades: Endpoint no implementado en el backend');
    return throwError(() => new Error('Endpoint no implementado'));
  }

  actualizarIdiomas(idiomas: IdiomaDTO[]): Observable<EstudianteDTO> {
    // NOTA: Este método requiere endpoint del backend PUT /api/students/profile/languages
    // Cuando esté disponible, implementar la llamada HTTP correspondiente
    console.warn('actualizarIdiomas: Endpoint no implementado en el backend');
    return throwError(() => new Error('Endpoint no implementado'));
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
    return this.authService.getCurrentUserId().pipe(
      switchMap(id => {
        const formData = new FormData();
        const authToken = this.authService.getIdTokenFromCookie();
        // Adjuntar el archivo y los campos requeridos por el backend:
        // @RequestPart("file"), @RequestPart("aplicante_id"), @RequestPart("auth_token")
        formData.append('file', archivo);
        formData.append('aplicante_id', String(id));
        formData.append('auth_token', authToken ?? '');

        return this.http
          .post<MateriasState>(
            `https://grade-processor.lafuah.com/procesar-notas`,
            formData
          )
          .pipe(
            tap((response) => this.setMateriasState(response)),
            catchError((error) => {
              console.error('Error al subir materias:', error);
              return throwError(() => error);
            })
          );
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
    return this.authService.getCurrentUserId().pipe(
      switchMap(studentId =>
        this.http
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
          )
      )
    );
  }

  retirarAplicacion(applicationId: number): Observable<void> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(() =>
        this.http
          .delete<void>(`${this.apiUrl}/applies/${applicationId}`)
          .pipe(
            tap(() => {
              console.log('Aplicación retirada con éxito');
            }),
            catchError((error) => {
              console.error('Error al retirar aplicación:', error);
              return throwError(() => error);
            })
          )
      )
    );
  }


  crearExperienciaLaboral(experiencia: CreateWorkExperienceDTO): Observable<WorkExperienceDTO> {
    return this.http
      .post<WorkExperienceDTO>(`${this.apiUrl}/work-experiences`, experiencia)
      .pipe(
        tap((response) => {
          console.log('Experiencia laboral creada:', response);
          // Recargar el perfil para actualizar la lista
          this.authService.getCurrentUserId().pipe(
            switchMap(id => this.getPerfil(id))
          ).subscribe();
        }),
        catchError((error) => {
          console.error('Error al crear experiencia laboral:', error);
          return throwError(() => error);
        })
      );
  }


  actualizarExperienciaLaboral(id: number, experiencia: UpdateWorkExperienceDTO): Observable<WorkExperienceDTO> {
    return this.http
      .put<WorkExperienceDTO>(`${this.apiUrl}/work-experiences/${id}`, experiencia)
      .pipe(
        tap((response) => {
          console.log('Experiencia laboral actualizada:', response);
          // Recargar el perfil para actualizar la lista
          this.authService.getCurrentUserId().pipe(
            switchMap(userId => this.getPerfil(userId))
          ).subscribe();
        }),
        catchError((error) => {
          console.error('Error al actualizar experiencia laboral:', error);
          return throwError(() => error);
        })
      );
  }


  eliminarExperienciaLaboral(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/work-experiences/${id}`)
      .pipe(
        tap(() => {
          console.log('Experiencia laboral eliminada');
          // Recargar el perfil para actualizar la lista
          this.authService.getCurrentUserId().pipe(
            switchMap(userId => this.getPerfil(userId))
          ).subscribe();
        }),
        catchError((error) => {
          console.error('Error al eliminar experiencia laboral:', error);
          return throwError(() => error);
        })
      );
  }

  // === Personal Projects ===
  crearProyectoPersonal(proyecto: CreatePersonalProjectDTO): Observable<PersonalProjectDTO> {
    return this.http
      .post<PersonalProjectDTO>(`${this.apiUrl}/personal-projects`, proyecto)
      .pipe(
        tap(response => {
          console.log('Proyecto personal creado:', response);
          this.authService.getCurrentUserId().pipe(
            switchMap(id => this.getPerfil(id))
          ).subscribe();
        }),
        catchError(error => {
          console.error('Error al crear proyecto personal:', error);
          return throwError(() => error);
        })
      );
  }

  actualizarProyectoPersonal(id: number, proyecto: UpdatePersonalProjectDTO): Observable<PersonalProjectDTO> {
    return this.http
      .put<PersonalProjectDTO>(`${this.apiUrl}/personal-projects/${id}`, proyecto)
      .pipe(
        tap(response => {
          console.log('Proyecto personal actualizado:', response);
          this.authService.getCurrentUserId().pipe(
            switchMap(uid => this.getPerfil(uid))
          ).subscribe();
        }),
        catchError(error => {
          console.error('Error al actualizar proyecto personal:', error);
          return throwError(() => error);
        })
      );
  }

  eliminarProyectoPersonal(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/personal-projects/${id}`)
      .pipe(
        tap(() => {
          console.log('Proyecto personal eliminado');
          this.authService.getCurrentUserId().pipe(
            switchMap(uid => this.getPerfil(uid))
          ).subscribe();
        }),
        catchError(error => {
          console.error('Error al eliminar proyecto personal:', error);
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
