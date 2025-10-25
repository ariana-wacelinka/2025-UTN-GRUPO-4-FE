import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-skills-card',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule
    ],
    template: `
    <mat-card class="modern-card skills-card">
      <mat-card-header>
        <mat-card-title class="section-title">
          <mat-icon class="section-icon">{{ titleIcon }}</mat-icon>
          {{ title }}
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="skills-container">
          <mat-chip-set class="skills-chips">
            <mat-chip *ngFor="let skill of skills" class="skill-chip">
              {{ skill }}
            </mat-chip>
          </mat-chip-set>
        </div>
      </mat-card-content>
    </mat-card>
  `,
    styleUrls: ['./skills-card.component.scss']
})
export class SkillsCardComponent {
    @Input() title: string = 'Habilidades';
    @Input() titleIcon: string = 'psychology';
    @Input() skills: string[] = [];
}