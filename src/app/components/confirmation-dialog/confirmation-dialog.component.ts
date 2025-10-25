import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: 'warning' | 'danger' | 'info';
}

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <div class="confirmation-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <mat-icon class="dialog-icon" [class]="'icon-' + data.type">
            {{ getIcon() }}
          </mat-icon>
          <h2 mat-dialog-title>{{ data.title }}</h2>
        </div>
      </div>

      <mat-dialog-content class="dialog-content">
        <p [innerHTML]="data.message"></p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <div class="actions-content">
          <button mat-button mat-dialog-close class="cancel-button">
            {{ data.cancelText }}
          </button>
          <button 
            mat-raised-button 
            [color]="getButtonColor()"
            [mat-dialog-close]="true"
            class="confirm-button">
            {{ data.confirmText }}
          </button>
        </div>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .confirmation-dialog {
      width: 100%;
    }

    .dialog-header {
      border-bottom: 1px solid var(--glass-border);
      margin-left: 20px;
      margin-top: 10px; 

      .header-content {
        display: flex;
        align-items: center;

        .dialog-icon {
          font-size: 2rem;
          width: 2rem;
          height: 2rem;

          &.icon-warning {
            color: var(--warning-color);
          }

          &.icon-danger {
            color: var(--error-color);
          }

          &.icon-info {
            color: var(--primary-color);
          }
        }

        h2 {
          margin: -10px 0px 0px -10px;
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }

    .dialog-content {
      padding: 24px !important;

      p {
        margin: 0;
        line-height: 1.6;
        color: var(--text-secondary);
        font-size: 1rem;
      }
    }

    .dialog-actions {
      padding: 16px 24px !important;
      background: var(--muted-bg);
      border-top: 1px solid var(--glass-border);

      .actions-content {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        width: 100%;

        .cancel-button {
          color: var(--text-secondary) !important;
          font-weight: 500 !important;
          text-transform: none !important;
          border-radius: var(--border-radius-small) !important;

          &:hover {
            background: var(--chip-bg) !important;
            color: var(--text-primary) !important;
          }
        }

        .confirm-button {
          border-radius: var(--border-radius-small) !important;
          font-weight: 600 !important;
          text-transform: none !important;
          min-width: 120px;
        }
      }
    }

    @media (max-width: 480px) {
      .confirmation-dialog {
        max-width: 95vw;
        margin: 16px;
      }

      .dialog-header {
        padding: 20px 16px 12px;

        .header-content {
          gap: 12px;

          .dialog-icon {
            font-size: 1.5rem;
            width: 1.5rem;
            height: 1.5rem;
          }

          h2 {
            font-size: 1.2rem;
          }
        }
      }

      .dialog-content {
        padding: 20px 16px !important;
      }

      .dialog-actions {
        padding: 12px 16px !important;

        .actions-content {
          flex-direction: column-reverse;
          gap: 8px;

          .cancel-button,
          .confirm-button {
            width: 100%;
            justify-content: center !important;
          }
        }
      }
    }
  `]
})
export class ConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
    ) { }

    getIcon(): string {
        switch (this.data.type) {
            case 'warning':
                return 'warning';
            case 'danger':
                return 'error';
            case 'info':
            default:
                return 'info';
        }
    }

    getButtonColor(): 'primary' | 'accent' | 'warn' {
        switch (this.data.type) {
            case 'danger':
                return 'warn';
            case 'warning':
                return 'accent';
            case 'info':
            default:
                return 'primary';
        }
    }
}