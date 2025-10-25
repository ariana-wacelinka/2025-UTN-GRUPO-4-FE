import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface InfoItem {
    icon: string;
    label: string;
    value: string;
}

export interface InfoCardData {
    title: string;
    icon: string;
    items: InfoItem[];
}

@Component({
    selector: 'app-info-card',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule
    ],
    template: `
    <mat-card class="modern-card info-card">
      <mat-card-header>
        <mat-card-title class="section-title">
          <mat-icon class="section-icon">{{ data.icon }}</mat-icon>
          {{ data.title }}
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="info-grid">
          <div *ngFor="let item of data.items" class="info-item">
            <mat-icon class="info-icon">{{ item.icon }}</mat-icon>
            <div class="info-content">
              <span class="info-label">{{ item.label }}</span>
              <span class="info-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
    styleUrls: ['./info-card.component.scss']
})
export class InfoCardComponent {
    @Input() data!: InfoCardData;
}