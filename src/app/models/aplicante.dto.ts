import { UsuarioDTO, IdiomaDTO } from './usuario.dto';

// Exportar IdiomaDTO para uso en otros archivos
export type { IdiomaDTO } from './usuario.dto';

export interface StudentDTO {
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
  githubUrl: string | null;
  career: string | null;
  currentYearLevel: number | null;
  institution: string | null;
  skills: string | null;
  incomeDate: string | null;
  dateOfBirth: string | null;
  cvUrl: string | null;
  cvFileName: string | null;
  coverLetter: string | null;
  languages: any[];
}

export interface AplicanteDTO {
  student: StudentDTO;
  customCoverLetter: string;
}

export interface AplicantesPagedResponse {
  content: AplicanteDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any[];
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: any[];
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// Mantenemos la interfaz anterior por compatibilidad, pero marcada como deprecated
/** @deprecated Use AplicantesPagedResponse instead */
export interface AplicanteListaDTO {
  ofertaId: number;
  ofertaTitulo: string;
  aplicantes: AplicanteDTO[];
  totalAplicantes: number;
}

// DTO del estudiante actualizado según el backend
export interface EstudianteDTO extends UsuarioDTO {
  githubUrl: string;
  career: string;
  currentYearLevel: number;
  institution: string;
  skills: string[];
  incomeDate: string;
  dateOfBirth: string;
  cvUrl: string;
  cvFileName: string;
  coverLetter: string;
  languages: IdiomaDTO[];
}

// DTO para actualizar estudiante
export interface ActualizarEstudianteDTO {
  description?: string;
  phone?: string;
  email?: string;
  location?: string;
  name?: string;
  surname?: string;
  imageUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  career?: string;
  currentYearLevel?: number;
  institution?: string;
  skills?: string[];
  incomeDate?: string;
  dateOfBirth?: string;
  cvUrl?: string;
  cvFileName?: string;
  coverLetter?: string;
  languages?: IdiomaDTO[];
}