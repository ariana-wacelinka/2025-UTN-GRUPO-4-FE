export enum EstadoAplicacion {
  APLICADO = 'APLICADO',
  NO_APLICADO = 'NO_APLICADO'
}

export enum Modalidad {
  REMOTO = 'remoto',
  HIBRIDO = 'hibrido',
  PRESENCIAL = 'presencial'
}

export interface Bidder {
  id: number;
  description: string | null;
  phone: string;
  email: string;
  location: string;
  name: string;
  surname: string;
  imageUrl: string | null;
  linkedinUrl: string | null;
  role: string;
}

export interface AplicacionDTO {
  offerId: number;
  studentId: number;
  customCoverLetter?: string;
}

export interface OfertaListaDTO {
  id: number;
  title: string;
  description: string;
  requirements: string;
  modality: string;
  location: string;
  estimatedPayment: string;
  applyList: any[];
  bidder: Bidder | null;
  estado?: EstadoAplicacion;
  attributes?: string[];
  userVote?: boolean | null;
  positiveVotes?: number;
  negativeVotes?: number;
  totalScore?: number;
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
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface VoteResponseDTO {
  userVote: boolean;
  positiveVotes: number;
  negativeVotes: number;
  totalScore: number;
}
