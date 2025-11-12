import { UsuarioDTO, IdiomaDTO } from './usuario.dto';

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

/** @deprecated Use AplicantesPagedResponse instead */
export interface AplicanteListaDTO {
  ofertaId: number;
  ofertaTitulo: string;
  aplicantes: AplicanteDTO[];
  totalAplicantes: number;
}

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
  subjects: SubjectDTO[];
  associatedCompanies?: AssociatedCompanyDTO[]; 
  workExperience?: WorkExperienceDTO[]; 
  personalProjects?: PersonalProjectDTO[]; 
}

export interface SubjectDTO {
  id: number;
  name: string;
  code: string;
  note: number;
}

export interface AssociatedCompanyDTO {
  id: number;
  companyId: number;
  companyName: string;
  companyImageUrl?: string;
  companyIndustry?: string;
  associationDate: string; 
  recognitionType?: string;
}

export interface WorkExperienceDTO {
  id?: number;
  studentId?: number;
  company: string;
  position: string;
  startDate: string; 
  endDate?: string; 
  description: string;
  isCurrentJob?: boolean;
}

export interface CreateWorkExperienceDTO {
  studentId: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrentJob?: boolean;
}

export interface UpdateWorkExperienceDTO {
  studentId?: number;
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isCurrentJob?: boolean;
}

export interface PersonalProjectDTO {
  id?: number;
  title: string;
  description: string;
  technologies: string[]; 
  projectUrl?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreatePersonalProjectDTO {
  studentId: number;
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePersonalProjectDTO {
  studentId?: number;
  title?: string;
  description?: string;
  technologies?: string[];
  projectUrl?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
}

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
  workExperience?: WorkExperienceDTO[];
  personalProjects?: PersonalProjectDTO[];
}
