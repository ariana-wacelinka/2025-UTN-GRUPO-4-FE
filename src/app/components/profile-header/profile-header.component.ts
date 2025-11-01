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
            <!-- Imagen normal o imagen con iniciales -->
            <div class="profile-image-wrapper">
              <img *ngIf="hasValidImage()"
                   [src]="getImageUrl()"
                   [alt]="data.name"
                   class="profile-image"
                   (error)="onImageError($event)">

              <!-- Avatar con iniciales si no hay imagen -->
              <div *ngIf="!hasValidImage()"
                   class="profile-avatar"
                   [style.background]="getGradientColor()">
                <span class="avatar-initials">{{ getInitials() }}</span>
              </div>
            </div>

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
              <p class="profile-title">{{ data.subtitle ? data.subtitle : '' }}</p>
              <p *ngIf="data.description" class="profile-description">{{ data.description ? data.description : '' }}</p>
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

  private imageLoadError = signal(false);

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageSelected.emit(input.files[0]);
    }
  }

  onImageError(event: Event) {
    this.imageLoadError.set(true);
  }

  hasValidImage(): boolean {
    const preview = this.imagePreview();
    if (preview) return true;

    return !!(this.data.imageUrl && !this.imageLoadError());
  }

  getImageUrl(): string {
    const preview = this.imagePreview();
    if (preview) return preview;

    return this.data.imageUrl || '';
  }

  getInitials(): string {
    const names = this.data.name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0] ? names[0][0].toUpperCase() : 'U';
  }

  getGradientColor(): string {
    // Generar un color basado en el nombre para consistencia
    const name = this.data.name;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
    ];

    return colors[Math.abs(hash) % colors.length];
  }
}
