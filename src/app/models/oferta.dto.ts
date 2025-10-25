export enum EstadoAplicacion {
  APLICADO = 'APLICADO',
  NO_APLICADO = 'NO_APLICADO'
}

export enum Modalidad {
  REMOTO = 'remoto',
  HIBRIDO = 'hibrido',
  PRESENCIAL = 'presencial'
}

export interface Empresa {
  id: number;
  nombre: string;
}

export interface AplicacionDTO {
  ofertaId: number;
  usuarioId: number;
  cartaPresentacion?: string;
}

export interface OfertaListaDTO {
  id: number;
  titulo: string;
  descripcion: string;
  requisitos: string;
  modalidad: string; // "remoto" | "híbrido" | "presencial"
  locacion: string;
  pagoAprox: string; // ejemplo: "USD 1500-2000"
  atributos: string[]; // ejemplo: ["Java", "Spring Boot", "Docker"]
  estado: EstadoAplicacion;
  empresa: Empresa;
}

export interface CrearOfertaDTO {
  bidderId: number;
  titulo: string;
  descripcion: string;
  requisitos: string;
  modalidad: string;
  locacion: string;
  pagoAprox?: string;
  atributos: string[];
}

export interface PagedResponseDTO<T> {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}