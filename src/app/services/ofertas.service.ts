import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, tap } from 'rxjs';
import { OfertaListaDTO, EstadoAplicacion, AplicacionDTO, CrearOfertaDTO, PagedResponseDTO } from '../models/oferta.dto';
import { AplicanteDTO, AplicanteListaDTO } from '../models/aplicante.dto';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class offersService {
  private offers: OfertaListaDTO[] = [];

  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {}

  getoffers(params?: {
    titulo?: string;
    empresaId?: number;
    tipoContrato?: string;
    locacion?: string;
    status?: string;
    usuarioId?: number;
    page?: number;
    size?: number;
  }): Observable<PagedResponseDTO<OfertaListaDTO>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PagedResponseDTO<OfertaListaDTO>>(`${this.apiUrl}/offers`, { params: httpParams }).pipe(
      tap(result => console.log(result))
    );
  }

  getOfertaById(id: number): Observable<OfertaListaDTO> {
    return this.http.get<OfertaListaDTO>(`${this.apiUrl}/offers/${id}`).pipe(
      tap(result => console.log(result))
    );
  }

  aplicarAOferta(aplicacion: AplicacionDTO): Observable<any> {
    console.log('Aplicando a oferta:', aplicacion);
    return this.http.post(`${this.apiUrl}/applies`, aplicacion);
  }

  getAplicantesPorOferta(ofertaId: number): Observable<AplicanteListaDTO> {
    return this.http.get<AplicanteListaDTO>(`${this.apiUrl}/applies?offerId=${ofertaId}`);
  }

  crearOferta(oferta: CrearOfertaDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/offers`, oferta);
  }



  descargarCV(aplicante: AplicanteDTO): void {
    if (aplicante.cvUrl) {
      const a = document.createElement('a');
      a.href = aplicante.cvUrl;
      a.download = aplicante.cvFileName || `CV_${aplicante.nombre.replace(/\s/g, '_')}.pdf`;
      a.click();
    }
  }


}
