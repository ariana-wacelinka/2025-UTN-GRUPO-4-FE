import { EstudianteDTO } from './aplicante.dto';
export interface EmpresaDTO {
  id: number;
  nombre: string;
  logo: string;
  descripcion: string;
  sector: string;
  tamanio: string;
  sitioWeb?: string;
  fechaFundacion?: string;
  ubicacion?: string;
  telefono?: string;
  email?: string;
  empleados?: EstudianteDTO[];
  redesSociales?: RedesSocialesDTO;
}

export interface RedesSocialesDTO {
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

export interface ActualizarEmpresaDTO {
  nombre?: string;
  descripcion?: string;
  sector?: string;
  tamanio?: string;
  fechaFundacion?: string;
  ubicacion?: string;
  telefono?: string;
  email?: string;
  sitioWeb?: string;
  redesSociales?: RedesSocialesDTO;
}
