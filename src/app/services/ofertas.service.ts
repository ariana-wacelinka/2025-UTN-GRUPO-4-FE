import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, tap, map } from 'rxjs';
import { OfertaListaDTO, EstadoAplicacion, AplicacionDTO, CrearOfertaDTO, PagedResponseDTO, VoteResponseDTO } from '../models/oferta.dto';
import { AplicanteDTO, AplicantesPagedResponse, StudentDTO } from '../models/aplicante.dto';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class offersService {
  private offers: OfertaListaDTO[] = [];

  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) { }

  getoffers(params?: {
    title?: string;
    description?: string;
    requirements?: number;
    modality?: string;
    location?: string;
    estimatedPayment?: number;
    bidderId?: number;
  }): Observable<PagedResponseDTO<OfertaListaDTO>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<PagedResponseDTO<OfertaListaDTO>>(`${this.apiUrl}/offers`, {
        params: httpParams,
      })
      .pipe(tap((result) => console.log(result)));
  }

  getOfertaById(id: number): Observable<OfertaListaDTO> {
    return this.http
      .get<OfertaListaDTO>(`${this.apiUrl}/offers/${id}`)
      .pipe(tap((result) => console.log(result)));
  }

  aplicarAOferta(aplicacion: AplicacionDTO): Observable<any> {
    console.log('Aplicando a oferta:', aplicacion);
    console.log('URL completa:', `${this.apiUrl}/applies`);
    return this.http.post(`${this.apiUrl}/applies`, aplicacion).pipe(
      tap({
        next: (response) => console.log('✅ Respuesta exitosa:', response),
        error: (error) => console.error('❌ Error en petición:', error),
      })
    );
  }

  getAplicantesPorOferta(
    ofertaId: number
  ): Observable<AplicantesPagedResponse> {
    return this.http.get<AplicantesPagedResponse>(
      `${this.apiUrl}/applies?offerId=${ofertaId}`
    );
  }

  crearOferta(oferta: CrearOfertaDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/offers`, oferta);
  }

  /**
   * Elimina una oferta por ID
   * @param id ID de la oferta a eliminar
   * @returns Observable<void>
   */
  eliminarOferta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/offers/${id}`).pipe(
      tap(() => console.log(`✅ Oferta ${id} eliminada exitosamente`))
    );
  }

  descargarCV(aplicante: AplicanteDTO): void {
    const student = aplicante.student;
    if (student.cvUrl) {
      const a = document.createElement('a');
      a.href = student.cvUrl;
      a.download =
        student.cvFileName ||
        `CV_${student.name.replace(/\s/g, '_')}_${student.surname.replace(
          /\s/g,
          '_'
        )}.pdf`;
      a.click();
    }
  }

  /**
   * Verifica si un estudiante ya aplicó a una oferta específica
   * @param offerId ID de la oferta
   * @param studentId ID del estudiante
   * @returns Observable<boolean> true si ya aplicó, false si no
   */
  alumnoYaAplico(offerId: number, studentId: number): Observable<boolean> {
    return this.http
      .get<AplicantesPagedResponse>(
        `${this.apiUrl}/applies?offerId=${offerId}&studentId=${studentId}`
      )
      .pipe(
        map((response: AplicantesPagedResponse) => {
          // Verificar si hay aplicaciones y si alguna coincide con el student ID
          return response.content.some(
            (aplicante) => aplicante.student.id === studentId
          );
        }),
        tap((yaAplico) =>
          console.log(
            `🔍 Usuario ${studentId} ya aplicó a oferta ${offerId}:`,
            yaAplico
          )
        )
      );
  }

  /**
   * Da un voto positivo (like) a una oferta
   * @param offerId ID de la oferta
   * @returns Observable<VoteResponseDTO> respuesta con información de votación
   */
  likeOferta(offerId: number): Observable<VoteResponseDTO> {
    return this.http.post<VoteResponseDTO>(`${this.apiUrl}/offers/${offerId}/votes/like`, {})
      .pipe(
        tap((response) => console.log(`👍 Like enviado para oferta ${offerId}:`, response))
      );
  }

  /**
   * Da un voto negativo (dislike) a una oferta
   * @param offerId ID de la oferta
   * @returns Observable<VoteResponseDTO> respuesta con información de votación
   */
  dislikeOferta(offerId: number): Observable<VoteResponseDTO> {
    return this.http.post<VoteResponseDTO>(`${this.apiUrl}/offers/${offerId}/votes/dislike`, {})
      .pipe(
        tap((response) => console.log(`👎 Dislike enviado para oferta ${offerId}:`, response))
      );
  }

  /**
   * Obtiene el estado de votación de una oferta
   * @param offerId ID de la oferta
   * @returns Observable<VoteResponseDTO> información de votación actual
   */
  getVotesOferta(offerId: number): Observable<VoteResponseDTO> {
    return this.http.get<VoteResponseDTO>(`${this.apiUrl}/offers/${offerId}/votes`)
      .pipe(
        tap((response) => console.log(`📊 Votos obtenidos para oferta ${offerId}:`, response))
      );
  }

  /**
   * Elimina el voto actual del usuario en una oferta
   * @param offerId ID de la oferta
   * @returns Observable<VoteResponseDTO> nuevo estado de votación
   */
  removeVoteOferta(offerId: number): Observable<VoteResponseDTO> {
    return this.http.delete<VoteResponseDTO>(`${this.apiUrl}/offers/${offerId}/votes`)
      .pipe(
        tap((response) => console.log(`🗑️ Voto removido para oferta ${offerId}:`, response))
      );
  }
}
