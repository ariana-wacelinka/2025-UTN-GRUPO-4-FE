import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AtributosService {
  private atributos: string[] = [
    'Angular', 'React', 'Vue.js', 'Node.js', 'TypeScript', 'JavaScript',
    'Java', 'Spring Boot', 'Python', 'Django', 'Flask', 'C#', '.NET',
    'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust', 'Kotlin',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'Git', 'Jenkins', 'CI/CD', 'Agile', 'Scrum'
  ];

  buscarAtributos(query: string): Observable<string[]> {
    if (!query.trim()) {
      return of([]);
    }
    
    const filtrados = this.atributos.filter(attr => 
      attr.toLowerCase().includes(query.toLowerCase())
    );
    
    return of(filtrados).pipe(delay(300));
  }

  crearAtributo(nombre: string): Observable<string> {
    const nuevoAtributo = nombre.trim();
    if (!this.atributos.includes(nuevoAtributo)) {
      this.atributos.push(nuevoAtributo);
    }
    return of(nuevoAtributo);
  }
}