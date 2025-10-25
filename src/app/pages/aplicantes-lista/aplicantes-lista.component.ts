import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { offersService } from '../../services/ofertas.service';
import { AplicanteDTO, AplicantesPagedResponse } from '../../models/aplicante.dto';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-aplicantes-lista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './aplicantes-lista.component.html',
  styleUrls: ['./aplicantes-lista.component.scss']
})
export class AplicantesListaComponent implements OnInit {
  aplicantesData: AplicantesPagedResponse | null = null;
  aplicantes: AplicanteDTO[] = [];
  loading = true;
  error = '';
  ofertaId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ofertasService: offersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener el ID de la oferta de la ruta
    this.route.params.subscribe(params => {
      this.ofertaId = +params['id'];
      if (this.ofertaId) {
        this.cargarAplicantes();
      } else {
        this.error = 'ID de oferta inválido';
        this.loading = false;
      }
    });
  }

  /**
   * CA1: Carga el listado de personas que solicitaron aplicar
   */
  private cargarAplicantes(): void {
    this.loading = true;
    this.ofertasService.getAplicantesPorOferta(this.ofertaId).subscribe({
      next: (data: AplicantesPagedResponse) => {
        this.aplicantesData = data;
        this.aplicantes = data.content;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar los aplicantes';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  /**
   * CA2: Descarga el CV del aplicante
   */
  descargarCV(aplicante: AplicanteDTO, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.ofertasService.descargarCV(aplicante);
  }

  /**
   * CA3: Navega al perfil del usuario
   */
  verPerfil(aplicante: AplicanteDTO): void {
    // En el futuro esto navegará a /perfil/:id con el ID del aplicante
    this.router.navigate(['/perfil'], { queryParams: { userId: aplicante.student.id } });
  }

  volverAOfertas(): void {
    this.router.navigate(['/ofertas']);
  }
}
