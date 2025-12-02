import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="kpi-card" [class.loading]="loading">
      <div class="kpi-icon" [style.background]="iconBackground">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <div class="kpi-content">
        <div class="kpi-label">{{ label }}</div>
        <div class="kpi-value">
          <span *ngIf="!loading">{{ value }}</span>
          <div *ngIf="loading" class="skeleton"></div>
        </div>
        <div *ngIf="change !== undefined" class="kpi-change" [class.positive]="change > 0" [class.negative]="change < 0">
          <mat-icon>{{ change > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
          <span>{{ Math.abs(change) }}%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      display: flex;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
    }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: white;
      }
    }

    .kpi-content {
      flex: 1;
      min-width: 0;
    }

    .kpi-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-xs);
    }

    .kpi-value {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      line-height: 1.2;
      margin-bottom: var(--spacing-xs);

      .skeleton {
        width: 80px;
        height: 36px;
        background: linear-gradient(90deg, var(--color-background) 0%, var(--color-border) 50%, var(--color-background) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: var(--radius-sm);
      }
    }

    .kpi-change {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &.positive {
        color: var(--color-success);
      }

      &.negative {
        color: var(--color-error);
      }
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class KpiCardComponent {
  @Input() label!: string;
  @Input() value!: string | number;
  @Input() icon!: string;
  @Input() iconBackground = 'var(--color-primary)';
  @Input() change?: number;
  @Input() loading = false;

  Math = Math;
}
