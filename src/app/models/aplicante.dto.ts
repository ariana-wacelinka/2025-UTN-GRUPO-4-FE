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

export interface IdiomaDTO {
  idioma: string;
  nivel: string;
}

export interface EstudianteDTO {
  id?: number;
  nombre: string;
  apellido: string;
  imagen: string;
  email: string;
  linkedin: string;
  github: string;
  carrera: string;
  anio: string;
  universidad: string;
  descripcion: string;
  habilidades: string[];
  idiomas: IdiomaDTO[];
  telefono: string;
  ubicacion: string;
  fechaNacimiento: string;
  cvUrl: string;
  anioIngreso?: number;
  cvFileName?: string;
  cartaPresentacion?: string;
}

export interface ActualizarEstudianteDTO {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ubicacion: string;
  fechaNacimiento: string;
  carrera: string;
  anio: string;
  universidad: string;
  descripcion: string;
  linkedin: string;
  github: string;
  habilidades: string[];
  idiomas: IdiomaDTO[];
}