import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AtributosService {
  private atributosExistentes = [
    'Angular', 'React', 'Vue.js', 'JavaScript', 'TypeScript',
    'Java', 'Spring Boot', 'Python', 'Django', 'Flask',
    'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git',
    'HTML', 'CSS', 'SASS', 'Bootstrap', 'Material Design',
    'REST API', 'GraphQL', 'Microservicios', 'Testing',
    'Jest', 'Cypress', 'Selenium', 'Agile', 'Scrum'
  ];

  buscarAtributos(query: string): Observable<string[]> {
    const queryLower = query.toLowerCase();
    const coincidencias = this.atributosExistentes
      .filter(attr => attr.toLowerCase().includes(queryLower))
      .slice(0, 5);

    // Agregar la opción de crear nuevo al final si no existe exactamente
    const existeExacto = this.atributosExistentes
      .some(attr => attr.toLowerCase() === queryLower);

    if (!existeExacto && query.trim()) {
      const nuevoAtributo = this.capitalizarPrimeraLetra(query.trim());
      coincidencias.push(`"${nuevoAtributo}"`);
    }

    return of(coincidencias);
  }

  crearAtributo(nombre: string): Observable<string> {
    // Simular creación en backend
    const nombreCapitalizado = this.capitalizarPrimeraLetra(nombre);

    // Agregar a la lista local para futuras búsquedas
    if (!this.atributosExistentes.includes(nombreCapitalizado)) {
      this.atributosExistentes.push(nombreCapitalizado);
    }

    return of(nombreCapitalizado);
  }

  private capitalizarPrimeraLetra(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }
}
