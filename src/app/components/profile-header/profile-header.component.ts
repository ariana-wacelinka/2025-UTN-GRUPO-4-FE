import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ProfileHeaderData {
    name: string;
    subtitle: string;
    description?: string;
    imageUrl?: string;
    showDownloadCV?: boolean;
}

export interface SocialLink {
    icon: string;
    label: string;
    url: string;
}

@Component({
    selector: 'app-profile-header',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <mat-card class="modern-card profile-header">
      <div class="header-content">
        <div class="profile-image-section">
          <div class="image-container">
            <img [src]="getImageUrl()" [alt]="data.name" class="profile-image">
            
            <div *ngIf="isEditing()" class="image-hover-overlay">
              <input type="file" #imageInput accept="image/*" 
                     (change)="onImageSelected($event)" style="display: none">
              <div class="image-hover-content" (click)="imageInput.click()">
                <mat-icon>camera_alt</mat-icon>
                <span>Cambiar foto</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-info">
          <div class="profile-info-header">
            <div class="profile-text">
              <h1 class="profile-name">{{ data.name }}</h1>
              <p class="profile-title">{{ data.subtitle }}</p>
              <p *ngIf="data.description" class="profile-description">{{ data.description }}</p>
            </div>
            
            <div class="profile-actions">
              <!-- Social Links Compact -->
              <div *ngIf="socialLinks.length > 0" class="social-links-compact">
                <a *ngFor="let link of socialLinks" 
                   [href]="link.url" 
                   [title]="link.label"
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="social-link-icon">
                  <mat-icon>{{ link.icon }}</mat-icon>
                </a>
              </div>
              
              <div class="contact-buttons">
                <button *ngIf="!isEditing()" 
                        mat-raised-button 
                        color="primary" 
                        class="modern-button"
                        (click)="editProfile.emit()">
                  <mat-icon>edit</mat-icon>
                  Editar Perfil
                </button>
                
                <button *ngIf="isEditing()" 
                        mat-raised-button 
                        color="primary" 
                        class="modern-button"
                        (click)="saveChanges.emit()">
                  <mat-icon>save</mat-icon>
                  Guardar Cambios
                </button>
                
                <button *ngIf="isEditing()" 
                        mat-stroked-button 
                        class="modern-button"
                        (click)="cancelEdit.emit()">
                  <mat-icon>cancel</mat-icon>
                  Cancelar
                </button>
                
                <button *ngIf="!isEditing() && data.showDownloadCV" 
                        mat-stroked-button 
                        class="modern-button" 
                        (click)="downloadCV.emit()">
                  <mat-icon>download</mat-icon>
                  Descargar CV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </mat-card>
  `,
    styleUrls: ['./profile-header.component.scss']
})
export class ProfileHeaderComponent {
    @Input() data!: ProfileHeaderData;
    @Input() socialLinks: SocialLink[] = [];
    @Input() isEditing = signal(false);
    @Input() imagePreview = signal<string | null>(null);

    @Output() editProfile = new EventEmitter<void>();
    @Output() saveChanges = new EventEmitter<void>();
    @Output() cancelEdit = new EventEmitter<void>();
    @Output() downloadCV = new EventEmitter<void>();
    @Output() imageSelected = new EventEmitter<File>();

    onImageSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.imageSelected.emit(input.files[0]);
        }
    }

    getImageUrl(): string {
        const preview = this.imagePreview();
        if (preview) return preview;

        if (this.data.imageUrl) return this.data.imageUrl;

        // Imagen por defecto usando el nombre
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.data.name)}&background=6366f1&color=ffffff&size=150`;
    }
}