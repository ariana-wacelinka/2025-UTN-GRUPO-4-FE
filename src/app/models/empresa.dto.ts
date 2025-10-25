import { UsuarioDTO, CompanySize } from './usuario.dto';
import { EstudianteDTO } from './aplicante.dto';

// DTO de empresa actualizado según el backend
export interface EmpresaDTO extends UsuarioDTO {
  webSiteUrl: string;
  industry: string;
  size: CompanySize;
}

export interface RedesSocialesDTO {
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

// DTO para actualizar empresa
export interface ActualizarEmpresaDTO {
  description?: string;
  phone?: string;
  email?: string;
  location?: string;
  name?: string;
  imageUrl?: string;
  linkedinUrl?: string;
  webSiteUrl?: string;
  industry?: string;
  size?: CompanySize;
}
