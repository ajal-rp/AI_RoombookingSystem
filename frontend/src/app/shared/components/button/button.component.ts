import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'accent' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <button
      *ngIf="!routerLink"
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getButtonClasses()"
      (click)="handleClick($event)">
      <mat-spinner
        *ngIf="loading"
        [diameter]="getSpinnerSize()"
        class="button-spinner">
      </mat-spinner>
      <mat-icon *ngIf="icon && !loading">{{ icon }}</mat-icon>
      <ng-content></ng-content>
    </button>
    
    <a
      *ngIf="routerLink"
      [routerLink]="routerLink"
      [class]="'router-button ' + getButtonClasses()"
      [class.disabled]="disabled || loading">
      <mat-spinner
        *ngIf="loading"
        [diameter]="getSpinnerSize()"
        class="button-spinner">
      </mat-spinner>
      <mat-icon *ngIf="icon && !loading">{{ icon }}</mat-icon>
      <ng-content></ng-content>
    </a>
  `,
  styles: [`
    button, .router-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-weight: var(--font-weight-medium);
      line-height: 1;
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
      position: relative;
      text-decoration: none;

      &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      &:disabled, &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .button-spinner {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      &:has(.button-spinner) {
        mat-icon {
          opacity: 0;
        }
      }
    }

    // Sizes
    .btn-sm {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-xs);
      height: 32px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .btn-md {
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: var(--font-size-sm);
      height: 40px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .btn-lg {
      padding: var(--spacing-lg) var(--spacing-xl);
      font-size: var(--font-size-base);
      height: 48px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    // Variants
    .btn-primary {
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      color: white;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
        opacity: 0;
        transition: opacity var(--transition-base);
      }
      
      &:hover:not(:disabled) {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
        
        &::before {
          opacity: 1;
        }
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
      
      > * {
        position: relative;
        z-index: 1;
      }
    }

    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);

      &:hover:not(:disabled) {
        background: var(--color-surface-hover);
        border-color: var(--color-border-hover);
      }
    }

    .btn-outline {
      background: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);

      &:hover:not(:disabled) {
        background: var(--color-primary-light);
      }
    }

    .btn-accent {
      background: var(--color-accent);
      color: white;

      &:hover:not(:disabled) {
        background: var(--color-accent-hover);
        box-shadow: var(--shadow-md);
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    }

    .btn-ghost {
      background: transparent;
      color: var(--color-text-primary);

      &:hover:not(:disabled) {
        background: var(--color-surface-hover);
      }
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon?: string;
  @Input() fullWidth = false;
  @Input() routerLink?: string | any[];
  @Output() clicked = new EventEmitter<MouseEvent>();

  getButtonClasses(): string {
    const classes = [
      `btn-${this.variant}`,
      `btn-${this.size}`
    ];

    if (this.fullWidth) {
      classes.push('full-width');
    }

    return classes.join(' ');
  }

  getSpinnerSize(): number {
    switch (this.size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
