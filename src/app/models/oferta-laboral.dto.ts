export interface OfertaLaboralDTO {
    id: number;
    title: string;
    description: string;
    requirements: string;
    modality: ModalidadTrabajo;
    location: string;
    estimatedPayment: number;
    applyList: AplicanteOfertaDTO[];
    bidder: EmpresaBasicDTO | null;
    fechaCreacion?: Date;
    fechaVencimiento?: Date;
    activa?: boolean;
}

export interface AplicanteOfertaDTO {
    id: number;
    aplicante: AplicanteBasicDTO;
    fechaAplicacion: Date;
    estado: EstadoAplicacion;
    mensaje?: string;
}

export interface AplicanteBasicDTO {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    imageUrl?: string;
    universidadActual?: string;
    carreraActual?: string;
}

export interface EmpresaBasicDTO {
    id: number;
    name: string;
    industry: string;
    imageUrl?: string;
}

export interface CreateOfertaDTO {
    title: string;
    description: string;
    requirements: string;
    modality: ModalidadTrabajo;
    location: string;
    estimatedPayment: number;
    fechaVencimiento?: Date;
}

export interface UpdateOfertaDTO {
    title?: string;
    description?: string;
    requirements?: string;
    modality?: ModalidadTrabajo;
    location?: string;
    estimatedPayment?: number;
    fechaVencimiento?: Date;
    activa?: boolean;
}

export enum ModalidadTrabajo {
    PRESENCIAL = 'PRESENCIAL',
    REMOTO = 'REMOTO',
    HIBRIDO = 'HIBRIDO'
}

export enum EstadoAplicacion {
    PENDIENTE = 'PENDIENTE',
    REVISADA = 'REVISADA',
    ACEPTADA = 'ACEPTADA',
    RECHAZADA = 'RECHAZADA'
}

// Interfaces para filtros y búsqueda
export interface FiltrosOfertasDTO {
    modalidad?: ModalidadTrabajo;
    ubicacion?: string;
    salarioMin?: number;
    salarioMax?: number;
    activa?: boolean;
    fechaDesde?: Date;
    fechaHasta?: Date;
}

// Response interfaces para APIs
export interface OfertasListResponse {
    ofertas: OfertaLaboralDTO[];
    total: number;
    page: number;
    pageSize: number;
}

export interface AplicantesResponse {
    aplicantes: AplicanteOfertaDTO[];
    total: number;
}