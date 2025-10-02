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
