import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="kpi-card" [class.loading]="loading" [style.background]="gradientBackground">
      <div class="kpi-header">
        <div class="kpi-label">{{ label }}</div>
        <mat-icon class="kpi-card-icon">{{ icon }}</mat-icon>
      </div>
      <div class="kpi-value">
        <span *ngIf="!loading">{{ value }}</span>
        <div *ngIf="loading" class="skeleton"></div>
      </div>
      <div *ngIf="change !== undefined" class="kpi-change" [class.positive]="change > 0" [class.negative]="change < 0">
        <span>{{ change > 0 ? 'Increased' : 'Decreased' }} by {{ Math.abs(change) }}%</span>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--spacing-2xl);
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      transition: all var(--transition-base);
      position: relative;
      overflow: hidden;
      min-height: 180px;
      color: white;
      
      &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -20%;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
      }

      &:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-2xl);
      }
      
      > * {
        position: relative;
        z-index: 1;
      }
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-lg);
    }

    .kpi-label {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      color: rgba(255, 255, 255, 0.95);
      line-height: 1.4;
    }

    .kpi-card-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: rgba(255, 255, 255, 0.9);
    }

    .kpi-value {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-bold);
      color: white;
      line-height: 1.2;
      margin-bottom: var(--spacing-md);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      .skeleton {
        width: 120px;
        height: 42px;
        background: rgba(255, 255, 255, 0.2);
        animation: shimmer 1.5s infinite;
        border-radius: var(--radius-md);
      }
    }

    .kpi-change {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: rgba(255, 255, 255, 0.9);
      padding: var(--spacing-xs) var(--spacing-md);
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-full);
      backdrop-filter: blur(8px);
    }

    @keyframes shimmer {
      0% { opacity: 0.5; }
      50% { opacity: 1; }
      100% { opacity: 0.5; }
    }
  `]
})
export class KpiCardComponent {
  @Input() label!: string;
  @Input() value!: string | number;
  @Input() icon!: string;
  @Input() iconBackground = 'var(--color-primary)';
  @Input() gradientBackground = 'linear-gradient(135deg, #FE9496 0%, #FFA07A 100%)';
  @Input() change?: number;
  @Input() loading = false;

  Math = Math;
}
