import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface SocialLinkItem {
    icon: string;
    label: string;
    url: string;
    className?: string;
}

@Component({
    selector: 'app-social-links',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <mat-card class="modern-card links-card">
      <mat-card-header>
        <mat-card-title class="section-title">
          <mat-icon class="section-icon">{{ titleIcon }}</mat-icon>
          {{ title }}
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="social-links">
          <button *ngFor="let link of links" 
                  mat-raised-button 
                  [class]="'social-button ' + (link.className || '')"
                  (click)="openLink(link.url)">
            <mat-icon>{{ link.icon }}</mat-icon>
            {{ link.label }}
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
    styleUrls: ['./social-links.component.scss']
})
export class SocialLinksComponent {
    @Input() title: string = 'Enlaces Profesionales';
    @Input() titleIcon: string = 'link';
    @Input() links: SocialLinkItem[] = [];
    @Output() linkClicked = new EventEmitter<string>();

    openLink(url: string) {
        this.linkClicked.emit(url);
        if (url) {
            window.open(url, '_blank');
        }
    }
}