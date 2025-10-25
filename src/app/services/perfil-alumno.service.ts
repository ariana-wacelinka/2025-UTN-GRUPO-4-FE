import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { API_URL } from '../app.config';
import { EstudianteDTO, ActualizarEstudianteDTO, IdiomaDTO } from '../models/aplicante.dto';

@Injectable({
    providedIn: 'root'
})
export class PerfilAlumnoService {
    private perfilSubject = new BehaviorSubject<EstudianteDTO | null>(null);
    public perfil$ = this.perfilSubject.asObservable();

    private mockPerfil: EstudianteDTO = {
        id: 1,
        name: 'Ariana',
        surname: 'Wacelinka',
        imageUrl: 'https://tse2.mm.bing.net/th/id/OIP.5CC9Agv_WNLAAwLXTaSzGAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
        email: 'arianawacelinka@alu.frlp.utn.edu.ar',
        phone: '+54 9 221 3199796',
        location: 'La Plata, Buenos Aires',
        linkedinUrl: 'https://www.linkedin.com/in/ariana-wacelinka-652a70208/',
        description: 'Estudiante apasionada por el desarrollo de software con experiencia en proyectos académicos y personales. Me especializo en desarrollo web full-stack y tengo particular interés en UX/UI y tecnologías emergentes.',
        role: 'estudiante',
        career: 'Ingenieria en sistemas de informacion',
        currentYearLevel: 4,
        institution: 'Universidad Tecnologica Nacional - Facultad Regional La Plata',
        skills: [
            'JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js',
            'Python', 'Java', 'MySQL', 'MongoDB', 'Git', 'Docker'
        ],
        languages: [
            { id: 1, name: 'Español', level: 5 },
            { id: 2, name: 'Inglés', level: 4 },
        ],
        cvUrl: '/assets/documents/WACELINKA, Ariana.pdf',
        cvFileName: 'WACELINKA_Ariana.pdf',
        githubUrl: 'https://github.com/ariana-wacelinka/',
        incomeDate: '2022-03-01',
        dateOfBirth: '2002-03-15',
        coverLetter: 'Estudiante apasionada por el desarrollo full-stack.'
    };

    constructor(
        private http: HttpClient,
        @Inject(API_URL) private apiUrl: string
    ) {
        this.perfilSubject.next(this.mockPerfil);
    }

    getPerfil(): Observable<EstudianteDTO> {
        return of({ ...this.mockPerfil });
    }

    actualizarPerfil(datosActualizados: ActualizarEstudianteDTO): Observable<EstudianteDTO> {
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
        this.mockPerfil.imageUrl = mockImageUrl;
        this.perfilSubject.next(this.mockPerfil);

        return of({ imageUrl: mockImageUrl });
    }

    subirCV(archivo: File): Observable<{ cvUrl: string }> {
        const mockCvUrl = `/assets/documents/${archivo.name}`;
        this.mockPerfil.cvUrl = mockCvUrl;
        this.perfilSubject.next(this.mockPerfil);

        return of({ cvUrl: mockCvUrl });
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
}