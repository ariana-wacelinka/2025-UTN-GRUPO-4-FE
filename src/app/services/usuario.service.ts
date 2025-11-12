import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { API_URL } from '../app.config';
import { UsuarioDTO } from '../models/usuario.dto';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface SortInfo {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface Pageable {
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
  sort: SortInfo[];
  unpaged: boolean;
}

export interface PagedUserSearchResponse {
  totalPages: number;
  totalElements: number;
  pageable: Pageable;
  size: number;
  content: UsuarioDTO[];
  number: number;
  sort: SortInfo[];
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {}

  getCurrentUser(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`);
  }

  /**
   * Busca usuarios por nombre y apellido
   * @param search - Término de búsqueda para filtrar usuarios
   * @param pageNumber - Número de página (opcional, default: 0)
   * @param pageSize - Tamaño de página (opcional, default: 10)
   * @param sort - Array de propiedades para ordenar (opcional)
   * @returns Observable con la respuesta paginada de usuarios
   */
  searchUsers(
    search: string,
    pageNumber: number = 0,
    pageSize: number = 10,
    sort: string[] = []
  ): Observable<PagedUserSearchResponse> {
    const pageableParam = {
      page: pageNumber,
      size: pageSize,
      sort: sort
    };

    let params = new HttpParams()
      .set('search', search)
      .set('pageable', JSON.stringify(pageableParam));

    return this.http.get<PagedUserSearchResponse>(
      `${this.apiUrl}/users/search`,
      { params }
    );
  }
}
