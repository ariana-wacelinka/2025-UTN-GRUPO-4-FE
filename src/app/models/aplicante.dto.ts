import { UsuarioDTO, IdiomaDTO } from './usuario.dto';

// Exportar IdiomaDTO para uso en otros archivos
export type { IdiomaDTO } from './usuario.dto';

export interface AplicanteDTO {
  id: number;
  usuarioId: number;
  nombre: string;
  email: string;
  carrera?: string;
  anioIngreso?: number;
  cvUrl?: string;
  cvFileName?: string;
  cartaPresentacion?: string;
  fechaAplicacion: string;
  ofertaId: number;
}

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