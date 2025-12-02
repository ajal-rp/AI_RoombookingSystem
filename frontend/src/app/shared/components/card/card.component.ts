import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getCardClasses()">
      <div *ngIf="title || hasHeaderSlot" class="card-header">
        <h3 *ngIf="title" class="card-title">{{ title }}</h3>
        <div *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</div>
        <ng-content select="[header]"></ng-content>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div *ngIf="hasFooterSlot" class="card-footer">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);
      overflow: hidden;
    }

    .card-hover:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .card-clickable {
      cursor: pointer;
    }

    .card-header {
      padding: var(--spacing-xl);
      border-bottom: 1px solid var(--color-border);
    }

    .card-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }

    .card-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-xs);
    }

    .card-body {
      padding: var(--spacing-xl);
    }

    .card-footer {
      padding: var(--spacing-xl);
      border-top: 1px solid var(--color-border);
      background: var(--color-background);
    }

    .card-compact .card-header,
    .card-compact .card-body,
    .card-compact .card-footer {
      padding: var(--spacing-md);
    }

    .card-bordered {
      border-width: 2px;
    }
  `]
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() hoverable = false;
  @Input() clickable = false;
  @Input() compact = false;
  @Input() bordered = false;

  hasHeaderSlot = false;
  hasFooterSlot = false;

  getCardClasses(): string {
    const classes = ['card'];
    
    if (this.hoverable) classes.push('card-hover');
    if (this.clickable) classes.push('card-clickable');
    if (this.compact) classes.push('card-compact');
    if (this.bordered) classes.push('card-bordered');
    
    return classes.join(' ');
  }
}
