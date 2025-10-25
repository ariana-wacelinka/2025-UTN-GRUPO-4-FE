import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_URL } from '../app.config';

export interface IdiomaDTO {
    idioma: string;
    nivel: string;
}

export interface PerfilAlumnoDTO {
    id?: number;
    nombre: string;
    apellido: string;
    imagen: string;
    email: string;
    linkedin: string;
    github: string;
    carrera: string;
    anio: string;
    universidad: string;
    descripcion: string;
    sobreMi: string;
    habilidades: string[];
    idiomas: IdiomaDTO[];
    telefono: string;
    ubicacion: string;
    fechaNacimiento: string;
    curriculumUrl: string;
}

export interface ActualizarPerfilDTO {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    ubicacion: string;
    fechaNacimiento: string;
    carrera: string;
    anio: string;
    universidad: string;
    descripcion: string;
    sobreMi: string;
    linkedin: string;
    github: string;
    habilidades: string[];
    idiomas: IdiomaDTO[];
}

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
    providedIn: 'root'
})
export class PerfilAlumnoService {
    private perfilSubject = new BehaviorSubject<PerfilAlumnoDTO | null>(null);
    public perfil$ = this.perfilSubject.asObservable();
    private materiasSubject = new BehaviorSubject<MateriasState>(DEFAULT_MATERIAS_STATE);
    public materias$ = this.materiasSubject.asObservable();

    private readonly materiasEndpoint: string;

    private mockPerfil: PerfilAlumnoDTO = {
        id: 1,
        nombre: 'Ariana',
        apellido: 'Wacelinka',
        imagen: 'https://tse2.mm.bing.net/th/id/OIP.5CC9Agv_WNLAAwLXTaSzGAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
        email: 'arianawacelinka@alu.frlp.utn.edu.ar',
        linkedin: 'https://www.linkedin.com/in/ariana-wacelinka-652a70208/',
        github: 'https://github.com/ariana-wacelinka/',
        carrera: 'Ingenieria en sistemas de informacion',
        anio: '4to año',
        universidad: 'Universidad Tecnologica Nacional - Facultad Regional La Plata',
        descripcion: 'Estudiante apasionada por el desarrollo de software con experiencia en proyectos académicos y personales. Me especializo en desarrollo web full-stack y tengo particular interés en UX/UI y tecnologías emergentes.',
        sobreMi: 'Soy una persona proactiva, responsable y siempre dispuesta a aprender nuevas tecnologías. Me gusta trabajar en equipo y enfrentar desafíos que me permitan crecer profesionalmente. En mi tiempo libre disfruto de la programación personal, leer sobre nuevas tecnologías y practicar deportes.',
        habilidades: [
            'JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js',
            'Python', 'Java', 'MySQL', 'MongoDB', 'Git', 'Docker'
        ],
        idiomas: [
            { idioma: 'Español', nivel: 'Nativo' },
            { idioma: 'Inglés', nivel: 'Avanzado' },
        ],
        telefono: '+54 9 221 3199796',
        ubicacion: 'La Plata, Buenos Aires',
        fechaNacimiento: '12 de marzo de 2004',
        curriculumUrl: '/assets/documents/WACELINKA, Ariana.pdf'
    };

    constructor(
        private http: HttpClient,
        @Inject(API_URL) private apiUrl: string
    ) {
        this.perfilSubject.next(this.mockPerfil);
        this.materiasEndpoint = `${this.apiUrl}/students/profile/subjects`;
    }

    getPerfil(): Observable<PerfilAlumnoDTO> {
        return of({ ...this.mockPerfil });
    }

    actualizarPerfil(datosActualizados: ActualizarPerfilDTO): Observable<PerfilAlumnoDTO> {
        const perfilActualizado = {
            ...this.mockPerfil,
            ...datosActualizados
        };

        this.mockPerfil = perfilActualizado;
        this.perfilSubject.next(perfilActualizado);

        return of(perfilActualizado);
    }

    subirImagenPerfil(archivo: File): Observable<{ imageUrl: string }> {
        const mockImageUrl = 'https://via.placeholder.com/300x300';
        this.mockPerfil.imagen = mockImageUrl;
        this.perfilSubject.next(this.mockPerfil);

        return of({ imageUrl: mockImageUrl });
    }

    subirCV(archivo: File): Observable<{ cvUrl: string }> {
        const mockCvUrl = `/assets/documents/${archivo.name}`;
        this.mockPerfil.curriculumUrl = mockCvUrl;
        this.perfilSubject.next(this.mockPerfil);

        return of({ cvUrl: mockCvUrl });
    }

    descargarCV(): void {
        const perfil = this.perfilSubject.value;
        if (!perfil?.curriculumUrl) {
            console.error('No hay URL de curriculum disponible');
            return;
        }

        const link = document.createElement('a');
        link.href = perfil.curriculumUrl;
        link.download = `CV_${perfil.nombre}_${perfil.apellido}.pdf`;
        link.target = '_blank';

        if (perfil.curriculumUrl.startsWith('http')) {
            window.open(perfil.curriculumUrl, '_blank');
        } else {
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    actualizarHabilidades(habilidades: string[]): Observable<PerfilAlumnoDTO> {
        this.mockPerfil.habilidades = [...habilidades];
        this.perfilSubject.next(this.mockPerfil);

        return of(this.mockPerfil);
    }

    actualizarIdiomas(idiomas: IdiomaDTO[]): Observable<PerfilAlumnoDTO> {
        this.mockPerfil.idiomas = [...idiomas];
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
            tap(response => this.setMateriasState(response)),
            catchError(error => {
                console.error('Error al cargar materias:', error);
                this.setMateriasState(DEFAULT_MATERIAS_STATE);
                return of(DEFAULT_MATERIAS_STATE);
            })
        );
    }

    subirMateriasExcel(archivo: File): Observable<MateriasState> {
        const formData = new FormData();
        formData.append('file', archivo);

        return this.http.post<MateriasState>(`${this.materiasEndpoint}/upload`, formData).pipe(
            tap(response => this.setMateriasState(response)),
            catchError(error => {
                console.error('Error al subir materias:', error);
                return throwError(() => error);
            })
        );
    }

    private setMateriasState(state: MateriasState) {
        const materias = state.materias ? state.materias.map(materia => ({ ...materia })) : [];
        const promedioCalculado = this.calcularPromedio(materias);
        const promedio = Number((state.promedioGeneral ?? promedioCalculado).toFixed(2));
        const total = state.totalMaterias ?? materias.length;

        this.materiasSubject.next({
            materias,
            promedioGeneral: promedio,
            totalMaterias: total
        });
    }

    private calcularPromedio(materias: MateriaDTO[]): number {
        if (!materias.length) {
            return 0;
        }

        const suma = materias
            .map(materia => materia.nota)
            .filter(nota => typeof nota === 'number' && !Number.isNaN(nota))
            .reduce((acc, nota) => acc + nota, 0);

        const cantidadNotas = materias.filter(materia => typeof materia.nota === 'number' && !Number.isNaN(materia.nota)).length;

        return cantidadNotas ? suma / cantidadNotas : 0;
    }
}