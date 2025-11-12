import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_URL } from '../app.config';
import { AtributoDto } from '../models/atributo.dto';

@Injectable({
  providedIn: 'root'
})
export class AtributosService {
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {}

  buscarAtributos(query: string): Observable<string[]> {
    if (!query.trim()) {
      return of([]);
    }

    const params = new HttpParams().set('name', query.trim());

    return this.http.get<AtributoDto[]>(`${this.apiUrl}/attributes`, { params }).pipe(
      map((atributos: AtributoDto[]) => {
        const nombres = atributos.map(attr => attr.name).slice(0, 5);

        // Verificar si existe una coincidencia exacta
        const existeExacto = atributos.some(attr =>
          attr.name.toLowerCase() === query.trim().toLowerCase()
        );

        // Si no existe exacto, agregar opción de crear nuevo
        if (!existeExacto && query.trim()) {
          const nuevoAtributo = this.capitalizarPrimeraLetra(query.trim());
          nombres.push(`"${nuevoAtributo}"`);
        }

        return nombres;
      }),
      catchError(() => {
        // En caso de error, permitir crear el atributo nuevo
        const nuevoAtributo = this.capitalizarPrimeraLetra(query.trim());
        return of([`"${nuevoAtributo}"`]);
      })
    );
  }

  crearAtributo(nombre: string): Observable<string> {
    // NOTA: Este método requiere endpoint del backend POST /api/attributes
    // Cuando el backend esté disponible, reemplazar con:
    // return this.http.post<AtributoDto>(`${this.apiUrl}/attributes`, { name: nombre }).pipe(
    //   map(attr => attr.name)
    // );
    
    // Implementación temporal hasta que el backend esté disponible
    const nombreCapitalizado = this.capitalizarPrimeraLetra(nombre);
    return of(nombreCapitalizado);
  }

  private capitalizarPrimeraLetra(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }
}
