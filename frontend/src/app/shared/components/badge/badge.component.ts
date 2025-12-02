import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'pending' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <span [class]="getBadgeClasses()">
      <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    span {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 4px var(--spacing-md);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      line-height: 1.2;
      white-space: nowrap;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .badge-success {
      background: var(--color-success-bg);
      color: var(--color-success);
      border: 1px solid var(--color-success-border);
    }

    .badge-warning {
      background: var(--color-warning-bg);
      color: var(--color-warning);
      border: 1px solid var(--color-warning-border);
    }

    .badge-error {
      background: var(--color-error-bg);
      color: var(--color-error);
      border: 1px solid var(--color-error-border);
    }

    .badge-pending {
      background: var(--color-pending-bg);
      color: var(--color-pending);
      border: 1px solid var(--color-pending-border);
    }

    .badge-info {
      background: var(--color-info-bg);
      color: var(--color-info);
      border: 1px solid var(--color-info-border);
    }

    .badge-neutral {
      background: var(--color-background);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }

    .badge-sm {
      padding: 2px var(--spacing-sm);
      font-size: 11px;

      mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
      }
    }

    .badge-lg {
      padding: 6px var(--spacing-lg);
      font-size: var(--font-size-sm);

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() icon?: string;

  getBadgeClasses(): string {
    const classes = [`badge-${this.variant}`];
    
    if (this.size !== 'md') {
      classes.push(`badge-${this.size}`);
    }
    
    return classes.join(' ');
  }
}
