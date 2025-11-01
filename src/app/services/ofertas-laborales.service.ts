import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
    OfertaLaboralDTO,
    CreateOfertaDTO,
    UpdateOfertaDTO,
    AplicanteOfertaDTO,
    FiltrosOfertasDTO,
    OfertasListResponse,
    AplicantesResponse,
    ModalidadTrabajo,
    EstadoAplicacion
} from '../models/oferta-laboral.dto';

@Injectable({
    providedIn: 'root'
})
export class OfertasLaboralesService {
    private readonly apiUrl = `${environment.apiUrl}/api/ofertas`;

    constructor(private http: HttpClient) { }

    /**
     * Obtiene todas las ofertas de una empresa específica
     * GET /api/ofertas?empresaId={id}
     */
    getOfertasByEmpresa(empresaId: number, filtros?: FiltrosOfertasDTO): Observable<OfertasListResponse> {
        let params = new HttpParams().set('empresaId', empresaId.toString());

        if (filtros) {
            if (filtros.modalidad) {
                params = params.set('modalidad', filtros.modalidad);
            }
            if (filtros.ubicacion) {
                params = params.set('ubicacion', filtros.ubicacion);
            }
            if (filtros.salarioMin !== undefined) {
                params = params.set('salarioMin', filtros.salarioMin.toString());
            }
            if (filtros.salarioMax !== undefined) {
                params = params.set('salarioMax', filtros.salarioMax.toString());
            }
            if (filtros.activa !== undefined) {
                params = params.set('activa', filtros.activa.toString());
            }
            if (filtros.fechaDesde) {
                params = params.set('fechaDesde', filtros.fechaDesde.toISOString());
            }
            if (filtros.fechaHasta) {
                params = params.set('fechaHasta', filtros.fechaHasta.toISOString());
            }
        }

        return this.http.get<OfertasListResponse>(this.apiUrl, { params })
            .pipe(
                map(response => ({
                    ...response,
                    ofertas: response.ofertas.map(oferta => this.transformOfertaFromAPI(oferta))
                })),
                catchError(this.handleError)
            );
    }

    /**
     * Obtiene una oferta específica por ID
     * GET /api/ofertas/{id}
     */
    getOfertaById(id: number): Observable<OfertaLaboralDTO> {
        return this.http.get<OfertaLaboralDTO>(`${this.apiUrl}/${id}`)
            .pipe(
                map(oferta => this.transformOfertaFromAPI(oferta)),
                catchError(this.handleError)
            );
    }

    /**
     * Obtiene todos los aplicantes de una oferta específica
     * GET /api/aplicantes/oferta/{id}
     */
    getAplicantesByOferta(ofertaId: number): Observable<AplicantesResponse> {
        return this.http.get<AplicantesResponse>(`${environment.apiUrl}/api/aplicantes/oferta/${ofertaId}`)
            .pipe(
                map(response => ({
                    ...response,
                    aplicantes: response.aplicantes.map(aplicante => this.transformAplicanteFromAPI(aplicante))
                })),
                catchError(this.handleError)
            );
    }

    /**
     * Crea una nueva oferta laboral
     * POST /api/ofertas
     */
    createOferta(oferta: CreateOfertaDTO): Observable<OfertaLaboralDTO> {
        const ofertaForAPI = this.transformOfertaToAPI(oferta);

        return this.http.post<OfertaLaboralDTO>(this.apiUrl, ofertaForAPI)
            .pipe(
                map(response => this.transformOfertaFromAPI(response)),
                catchError(this.handleError)
            );
    }

    /**
     * Verifica si el usuario actual puede editar la oferta
     * @param oferta Oferta a verificar
     * @param currentUserId ID del usuario actual
     * @returns true si puede editar, false si no
     */
    canEditOferta(oferta: OfertaLaboralDTO, currentUserId: number): boolean {
        return oferta.bidder.id === currentUserId;
    }

    /**
     * Actualiza una oferta existente
     * PUT /api/offers/{id}
     */
    updateOferta(id: number, oferta: UpdateOfertaDTO): Observable<OfertaLaboralDTO> {
        const ofertaForAPI = {
            title: oferta.title,
            description: oferta.description,
            requirements: oferta.requirements,
            modality: oferta.modality,
            location: oferta.location,
            estimatedPayment: oferta.estimatedPayment?.toString(),
            attributes: (oferta as any).attributes || []
        };

        return this.http.put<OfertaLaboralDTO>(`${environment.apiUrl}/offers/${id}`, ofertaForAPI)
            .pipe(
                map(response => this.transformOfertaFromAPI(response)),
                catchError(this.handleError)
            );
    }

    /**
     * Desactiva una oferta (dar de baja)
     * PATCH /api/ofertas/desactivar/{id}
     */
    desactivarOferta(id: number): Observable<OfertaLaboralDTO> {
        return this.http.patch<OfertaLaboralDTO>(`${this.apiUrl}/desactivar/${id}`, {})
            .pipe(
                map(response => this.transformOfertaFromAPI(response)),
                catchError(this.handleError)
            );
    }

    /**
     * Reactiva una oferta
     * PATCH /api/ofertas/activar/{id}
     */
    activarOferta(id: number): Observable<OfertaLaboralDTO> {
        return this.http.patch<OfertaLaboralDTO>(`${this.apiUrl}/activar/${id}`, {})
            .pipe(
                map(response => this.transformOfertaFromAPI(response)),
                catchError(this.handleError)
            );
    }

    /**
     * Actualiza el estado de una aplicación
     * PATCH /api/aplicantes/{aplicanteId}/estado
     */
    actualizarEstadoAplicacion(aplicanteId: number, nuevoEstado: EstadoAplicacion, mensaje?: string): Observable<AplicanteOfertaDTO> {
        const body = { estado: nuevoEstado, mensaje };

        return this.http.patch<AplicanteOfertaDTO>(`${environment.apiUrl}/api/aplicantes/${aplicanteId}/estado`, body)
            .pipe(
                map(response => this.transformAplicanteFromAPI(response)),
                catchError(this.handleError)
            );
    }

    /**
     * Obtiene estadísticas de ofertas de la empresa
     * GET /api/ofertas/stats?empresaId={id}
     */
    getEstadisticasOfertas(empresaId: number): Observable<any> {
        const params = new HttpParams().set('empresaId', empresaId.toString());

        return this.http.get(`${this.apiUrl}/stats`, { params })
            .pipe(catchError(this.handleError));
    }

    // Métodos de utilidad para transformaciones de datos
    private transformOfertaFromAPI(oferta: any): OfertaLaboralDTO {
        return {
            ...oferta,
            fechaCreacion: oferta.fechaCreacion ? new Date(oferta.fechaCreacion) : undefined,
            fechaVencimiento: oferta.fechaVencimiento ? new Date(oferta.fechaVencimiento) : undefined,
            applyList: oferta.applyList ? oferta.applyList.map((app: any) => this.transformAplicanteFromAPI(app)) : []
        };
    }

    private transformAplicanteFromAPI(aplicante: any): AplicanteOfertaDTO {
        return {
            ...aplicante,
            fechaAplicacion: new Date(aplicante.fechaAplicacion)
        };
    }

    private transformOfertaToAPI(oferta: CreateOfertaDTO | UpdateOfertaDTO): any {
        return {
            ...oferta,
            fechaVencimiento: oferta.fechaVencimiento ? oferta.fechaVencimiento.toISOString() : undefined
        };
    }

    // Métodos de utilidad para el componente
    getModalidadesDisponibles(): { value: ModalidadTrabajo; label: string }[] {
        return [
            { value: ModalidadTrabajo.PRESENCIAL, label: 'Presencial' },
            { value: ModalidadTrabajo.REMOTO, label: 'Remoto' },
            { value: ModalidadTrabajo.HIBRIDO, label: 'Híbrido' }
        ];
    }

    getEstadosAplicacion(): { value: EstadoAplicacion; label: string; color: string }[] {
        return [
            { value: EstadoAplicacion.PENDIENTE, label: 'Pendiente', color: 'orange' },
            { value: EstadoAplicacion.REVISADA, label: 'Revisada', color: 'blue' },
            { value: EstadoAplicacion.ACEPTADA, label: 'Aceptada', color: 'green' },
            { value: EstadoAplicacion.RECHAZADA, label: 'Rechazada', color: 'red' }
        ];
    }

    // Validaciones de negocio
    validarOferta(oferta: CreateOfertaDTO | UpdateOfertaDTO): string[] {
        const errores: string[] = [];

        if (!oferta.title || oferta.title.trim().length < 5) {
            errores.push('El título debe tener al menos 5 caracteres');
        }

        if (!oferta.description || oferta.description.trim().length < 50) {
            errores.push('La descripción debe tener al menos 50 caracteres');
        }

        if (!oferta.requirements || oferta.requirements.trim().length < 20) {
            errores.push('Los requisitos deben tener al menos 20 caracteres');
        }

        if (oferta.estimatedPayment !== undefined && oferta.estimatedPayment < 0) {
            errores.push('El salario estimado debe ser mayor a 0');
        }

        if (oferta.fechaVencimiento && oferta.fechaVencimiento <= new Date()) {
            errores.push('La fecha de vencimiento debe ser en el futuro');
        }

        return errores;
    }

    /**
     * Valida permisos de edición antes de actualizar
     * @param ofertaId ID de la oferta
     * @param currentUserId ID del usuario actual
     * @returns Observable que emite true si puede editar
     */
    validateEditPermissions(ofertaId: number, currentUserId: number): Observable<boolean> {
        return this.getOfertaById(ofertaId).pipe(
            map(oferta => this.canEditOferta(oferta, currentUserId)),
            catchError(() => {
                return throwError(() => new Error('No tienes permisos para editar esta oferta'));
            })
        );
    }

    private handleError = (error: any): Observable<never> => {
        console.error('Error en OfertasLaboralesService:', error);

        let errorMessage = 'Ha ocurrido un error inesperado';

        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.status === 401) {
            errorMessage = 'No tienes autorización para realizar esta acción';
        } else if (error.status === 403) {
            errorMessage = 'No tienes permisos para editar esta oferta. Solo el creador puede modificarla';
        } else if (error.status === 404) {
            errorMessage = 'El recurso solicitado no fue encontrado';
        } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor';
        }

        return throwError(() => new Error(errorMessage));
    };
}