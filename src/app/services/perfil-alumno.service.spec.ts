import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PerfilAlumnoService, PerfilAlumnoDTO, ActualizarPerfilDTO, IdiomaDTO, MateriasState, DEFAULT_MATERIAS_STATE } from './perfil-alumno.service';
import { API_URL } from '../app.config';

describe('PerfilAlumnoService', () => {
    let service: PerfilAlumnoService;
    let httpMock: HttpTestingController;
    const mockApiUrl = 'http://localhost:3000/api';

    const mockPerfil: PerfilAlumnoDTO = {
        id: 1,
        nombre: 'Test',
        apellido: 'User',
        imagen: 'test-image.jpg',
        email: 'test@test.com',
        linkedin: 'https://linkedin.com/test',
        github: 'https://github.com/test',
        carrera: 'Test Career',
        anio: '4to año',
        universidad: 'Test University',
        descripcion: 'Test description',
        sobreMi: 'Test about me section',
        habilidades: ['JavaScript', 'Angular'],
        idiomas: [{ idioma: 'Español', nivel: 'Nativo' }],
        telefono: '+54 123 456 789',
        ubicacion: 'Test City',
        fechaNacimiento: '01/01/2000',
        curriculumUrl: '/assets/test-cv.pdf'
    };

        const mockMateriasState: MateriasState = {
                materias: [
                        { codigo: '1234', nombre: 'Práctica Profesional', nota: 9, estado: 'Aprobada', fechaAprobacion: '2024-03-10' },
                        { codigo: '5678', nombre: 'Gestión de Proyectos', nota: 8, estado: 'Aprobada', fechaAprobacion: '2024-07-01' }
                ],
                promedioGeneral: 8.5,
                totalMaterias: 2
        };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PerfilAlumnoService,
                { provide: API_URL, useValue: mockApiUrl }
            ]
        });
        service = TestBed.inject(PerfilAlumnoService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('Service Initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should initialize with mock data', (done) => {
            service.perfil$.subscribe(perfil => {
                expect(perfil).toBeTruthy();
                expect(perfil?.nombre).toBe('Ariana');
                expect(perfil?.apellido).toBe('Wacelinka');
                done();
            });
        });
    });

    describe('getPerfil', () => {
        it('should return mock profile data', (done) => {
            service.getPerfil().subscribe(perfil => {
                expect(perfil).toBeTruthy();
                expect(perfil.nombre).toBe('Ariana');
                expect(perfil.apellido).toBe('Wacelinka');
                expect(perfil.email).toBe('arianawacelinka@alu.frlp.utn.edu.ar');
                expect(perfil.habilidades).toContain('JavaScript');
                expect(perfil.idiomas.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should have correct profile structure', (done) => {
            service.getPerfil().subscribe(perfil => {
                expect(perfil.id).toBeDefined();
                expect(perfil.nombre).toBeDefined();
                expect(perfil.apellido).toBeDefined();
                expect(perfil.email).toBeDefined();
                expect(perfil.habilidades).toBeDefined();
                expect(perfil.idiomas).toBeDefined();
                expect(Array.isArray(perfil.habilidades)).toBe(true);
                expect(Array.isArray(perfil.idiomas)).toBe(true);
                done();
            });
        });
    });

    describe('actualizarPerfil', () => {
        it('should update profile data', (done) => {
            const datosActualizados: ActualizarPerfilDTO = {
                nombre: 'Updated Name',
                apellido: 'Updated Lastname',
                email: 'updated@email.com',
                telefono: '+54 987 654 321',
                ubicacion: 'Updated City',
                fechaNacimiento: '02/02/2000',
                carrera: 'Updated Career',
                anio: '5to año',
                universidad: 'Updated University',
                descripcion: 'Updated description',
                sobreMi: 'Updated about me',
                linkedin: 'https://linkedin.com/updated',
                github: 'https://github.com/updated',
                habilidades: ['React', 'Node.js'],
                idiomas: [{ idioma: 'Inglés', nivel: 'Avanzado' }]
            };

            service.actualizarPerfil(datosActualizados).subscribe(perfilActualizado => {
                expect(perfilActualizado.nombre).toBe('Updated Name');
                expect(perfilActualizado.apellido).toBe('Updated Lastname');
                expect(perfilActualizado.email).toBe('updated@email.com');
                done();
            });
        });

        it('should update subject with new profile data', (done) => {
            const datosActualizados: ActualizarPerfilDTO = {
                nombre: 'New Name',
                apellido: 'Wacelinka',
                email: 'arianawacelinka@alu.frlp.utn.edu.ar',
                telefono: '+54 9 221 3199796',
                ubicacion: 'La Plata, Buenos Aires',
                fechaNacimiento: '12 de marzo de 2004',
                carrera: 'Ingenieria en sistemas de informacion',
                anio: '4to año',
                universidad: 'Universidad Tecnologica Nacional - Facultad Regional La Plata',
                descripcion: 'Updated description',
                sobreMi: 'New about me section',
                linkedin: 'https://www.linkedin.com/in/ariana-wacelinka-652a70208/',
                github: 'https://github.com/ariana-wacelinka/',
                habilidades: ['Python', 'Django'],
                idiomas: [{ idioma: 'Español', nivel: 'Nativo' }, { idioma: 'Inglés', nivel: 'Intermedio' }]
            };

            service.actualizarPerfil(datosActualizados).subscribe(() => {
                service.perfil$.subscribe(perfil => {
                    expect(perfil?.nombre).toBe('New Name');
                    done();
                });
            });
        });
    });

    describe('subirImagenPerfil', () => {
        it('should upload image and return URL', (done) => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

            service.subirImagenPerfil(mockFile).subscribe(response => {
                expect(response.imageUrl).toBeTruthy();
                expect(typeof response.imageUrl).toBe('string');
                done();
            });
        });

        it('should update profile with new image URL', (done) => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

            service.subirImagenPerfil(mockFile).subscribe(response => {
                service.perfil$.subscribe(perfil => {
                    expect(perfil?.imagen).toBe(response.imageUrl);
                    done();
                });
            });
        });
    });

    describe('subirCV', () => {
        it('should upload CV and return URL', (done) => {
            const mockFile = new File(['test'], 'test-cv.pdf', { type: 'application/pdf' });

            service.subirCV(mockFile).subscribe(response => {
                expect(response.cvUrl).toBeTruthy();
                expect(response.cvUrl).toContain('test-cv.pdf');
                done();
            });
        });

        it('should update profile with new CV URL', (done) => {
            const mockFile = new File(['test'], 'new-cv.pdf', { type: 'application/pdf' });

            service.subirCV(mockFile).subscribe(response => {
                service.perfil$.subscribe(perfil => {
                    expect(perfil?.curriculumUrl).toBe(response.cvUrl);
                    done();
                });
            });
        });
    });

    describe('descargarCV', () => {
        it('should call window.open for external URLs', () => {
            spyOn(window, 'open');

            service['mockPerfil'].curriculumUrl = 'https://example.com/cv.pdf';
            service['perfilSubject'].next(service['mockPerfil']);

            service.descargarCV();

            expect(window.open).toHaveBeenCalledWith('https://example.com/cv.pdf', '_blank');
        });

        it('should create download link for local files', () => {
            const createElementSpy = spyOn(document, 'createElement').and.callThrough();
            const appendChildSpy = spyOn(document.body, 'appendChild');
            const removeChildSpy = spyOn(document.body, 'removeChild');

            service['mockPerfil'].curriculumUrl = '/assets/local-cv.pdf';
            service['perfilSubject'].next(service['mockPerfil']);

            service.descargarCV();

            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();
        });

        it('should handle missing CV URL gracefully', () => {
            const consoleSpy = spyOn(console, 'error');

            service['mockPerfil'].curriculumUrl = '';
            service['perfilSubject'].next(service['mockPerfil']);

            service.descargarCV();

            expect(consoleSpy).toHaveBeenCalledWith('No hay URL de curriculum disponible');
        });
    });

    describe('actualizarHabilidades', () => {
        it('should update skills', (done) => {
            const nuevasHabilidades = ['React', 'Vue.js', 'Node.js'];

            service.actualizarHabilidades(nuevasHabilidades).subscribe(perfil => {
                expect(perfil.habilidades).toEqual(nuevasHabilidades);
                done();
            });
        });

        it('should update subject with new skills', (done) => {
            const nuevasHabilidades = ['Python', 'Django'];

            service.actualizarHabilidades(nuevasHabilidades).subscribe(() => {
                service.perfil$.subscribe(perfil => {
                    expect(perfil?.habilidades).toEqual(nuevasHabilidades);
                    done();
                });
            });
        });
    });

    describe('actualizarIdiomas', () => {
        it('should update languages', (done) => {
            const nuevosIdiomas: IdiomaDTO[] = [
                { idioma: 'Francés', nivel: 'Intermedio' },
                { idioma: 'Alemán', nivel: 'Básico' }
            ];

            service.actualizarIdiomas(nuevosIdiomas).subscribe(perfil => {
                expect(perfil.idiomas).toEqual(nuevosIdiomas);
                done();
            });
        });
    });

    describe('eliminarPerfil', () => {
        it('should delete profile', (done) => {
            service.eliminarPerfil().subscribe(response => {
                expect(response.success).toBe(true);
                done();
            });
        });

        it('should set profile subject to null', (done) => {
            service.eliminarPerfil().subscribe(() => {
                service.perfil$.subscribe(perfil => {
                    expect(perfil).toBeNull();
                    done();
                });
            });
        });
    });

    describe('gestión de materias', () => {
        it('should expose default materias state', (done) => {
            service.obtenerMateriasState().subscribe(state => {
                expect(state.totalMaterias).toBe(DEFAULT_MATERIAS_STATE.totalMaterias);
                expect(state.promedioGeneral).toBe(DEFAULT_MATERIAS_STATE.promedioGeneral);
                done();
            });
        });

        it('should load materias from backend and update state', (done) => {
            service.cargarMateriasDesdeBackend().subscribe(state => {
                expect(state.materias.length).toBe(mockMateriasState.materias.length);
                expect(state.promedioGeneral).toBe(mockMateriasState.promedioGeneral);
                done();
            });

            const req = httpMock.expectOne(`${mockApiUrl}/students/profile/subjects`);
            expect(req.request.method).toBe('GET');
            req.flush(mockMateriasState);
        });

        it('should upload materias excel and refresh state', (done) => {
            const mockFile = new File(['contenido'], 'materias.xls', { type: 'application/vnd.ms-excel' });

            service.subirMateriasExcel(mockFile).subscribe(state => {
                expect(state.totalMaterias).toBe(mockMateriasState.totalMaterias);
                expect(state.promedioGeneral).toBe(mockMateriasState.promedioGeneral);
                done();
            });

            const req = httpMock.expectOne(`${mockApiUrl}/students/profile/subjects/upload`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body instanceof FormData).toBeTrue();

            const formData = req.request.body as FormData;
            expect(formData.has('file')).toBeTrue();
            req.flush(mockMateriasState);
        });
    });
});