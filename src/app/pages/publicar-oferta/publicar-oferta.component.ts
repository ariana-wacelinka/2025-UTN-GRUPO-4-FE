import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CrearOfertaDTO, Modalidad } from '../../models/oferta.dto';
import { OfertasService } from '../../services/ofertas.service';
import { AtributosService } from '../../services/atributos.service';

@Component({
  selector: 'app-publicar-oferta',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Publicar Nueva Oferta</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form
            #ofertaForm="ngForm"
            (ngSubmit)="crearOferta()"
            class="create-offer-form"
          >
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título</mat-label>
              <input
                matInput
                [(ngModel)]="oferta.titulo"
                name="titulo"
                required
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea
                matInput
                [(ngModel)]="oferta.descripcion"
                name="descripcion"
                rows="4"
                required
              ></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Requisitos</mat-label>
              <textarea
                matInput
                [(ngModel)]="oferta.requisitos"
                name="requisitos"
                rows="4"
                required
              ></textarea>
            </mat-form-field>

            <div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Atributos</mat-label>
                <input
                  matInput
                  [(ngModel)]="atributoInput"
                  name="atributoInput"
                  (input)="buscarAtributos($event)"
                  (keydown.enter)="agregarAtributoEnter($event)"
                  [matAutocomplete]="auto"
                />
                <mat-autocomplete
                  #auto="matAutocomplete"
                  (optionSelected)="seleccionarAtributo($event)"
                >
                  @for (atributo of atributosSugeridos$ | async; track atributo)
                  {
                  <mat-option [value]="atributo">{{ atributo }}</mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>

              <mat-chip-set class="chips">
                @for (atributo of oferta.atributos; track atributo) {
                <mat-chip (removed)="removerAtributo(atributo)">
                  {{ atributo }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
                }
              </mat-chip-set>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Modalidad</mat-label>
              <mat-select
                [(ngModel)]="oferta.modalidad"
                name="modalidad"
                required
              >
                <mat-option [value]="Modalidad.REMOTO">Remoto</mat-option>
                <mat-option [value]="Modalidad.HIBRIDO">Híbrido</mat-option>
                <mat-option [value]="Modalidad.PRESENCIAL"
                  >Presencial</mat-option
                >
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Localidad</mat-label>
              <input
                matInput
                [(ngModel)]="oferta.locacion"
                name="locacion"
                required
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Pago Aproximado (opcional)</mat-label>
              <input
                matInput
                [(ngModel)]="oferta.pagoAprox"
                name="pagoAprox"
                placeholder="Ej: USD 2000-3000"
              />
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <button
            mat-raised-button
            color="primary"
            [disabled]="!ofertaForm.valid || oferta.atributos.length === 0"
            (click)="crearOferta()"
          >
            Publicar Oferta
          </button>
          <button mat-button (click)="cancelar()">Cancelar</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
      }

      .create-offer-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .full-width {
        width: 100%;
      }

      .atributos-chips {
        margin-bottom: 8px;
      }

      mat-card-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
    `,
  ],
})
export class PublicarOfertaComponent implements OnInit {
  oferta: CrearOfertaDTO = {
    titulo: '',
    descripcion: '',
    requisitos: '',
    modalidad: Modalidad.REMOTO,
    locacion: '',
    pagoAprox: '',
    atributos: [],
  };

  atributoInput = '';
  atributosSugeridos$: Observable<string[]> = of([]);
  Modalidad = Modalidad;

  constructor(
    private ofertasService: OfertasService,
    private atributosService: AtributosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si la lista de atributos esta vacia, sacarle la clase "atributos-chips" al mat-chip-set, para que no ocupe espacio innecesario
    // pero si tiene atributos, agregarle la clase para que tenga margen inferior. Se hace dinamicamente

  }

  buscarAtributos(event: any): void {
    const query = event.target.value;
    if (query.length > 0) {
      this.atributosSugeridos$ = of(query).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => this.atributosService.buscarAtributos(q))
      );
    } else {
      this.atributosSugeridos$ = of([]);
    }
  }

  seleccionarAtributo(event: any): void {
    const atributo = event.option.value;
    this.agregarAtributoALista(atributo);
    this.atributoInput = '';

    const atributosChips = document.querySelector('.chips');
    if (this.oferta.atributos.length === 0 && atributosChips) {
      atributosChips.classList.remove('atributos-chips');
    } else if (atributosChips) {
      atributosChips.classList.add('atributos-chips');
    }
  }

  agregarAtributoEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    if (this.atributoInput.trim()) {
      this.atributosService
        .crearAtributo(this.atributoInput.trim())
        .subscribe((atributo) => this.agregarAtributoALista(atributo));
      this.atributoInput = '';
    }

    const atributosChips = document.querySelector('.chips');
    if (this.oferta.atributos.length === 0 && atributosChips) {
      atributosChips.classList.remove('atributos-chips');
    } else if (atributosChips) {
      atributosChips.classList.add('atributos-chips');
    }
  }

  private agregarAtributoALista(atributo: string): void {
    if (!this.oferta.atributos.includes(atributo)) {
      this.oferta.atributos.push(atributo);
    }
  }

  removerAtributo(atributo: string): void {
    this.oferta.atributos = this.oferta.atributos.filter((a) => a !== atributo);
    const atributosChips = document.querySelector('.chips');
    if (this.oferta.atributos.length === 0 && atributosChips) {
      atributosChips.classList.remove('atributos-chips');
    } else if (atributosChips) {
      atributosChips.classList.add('atributos-chips');
    }
  }

  crearOferta(): void {
    if (
      this.oferta.titulo &&
      this.oferta.descripcion &&
      this.oferta.requisitos &&
      this.oferta.modalidad &&
      this.oferta.locacion &&
      this.oferta.atributos.length > 0
    ) {
      this.ofertasService.crearOferta(this.oferta);
      this.router.navigate(['/ofertas']);
    }
  }

  cancelar(): void {
    this.router.navigate(['/ofertas']);
  }
}
