import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'accent' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getButtonClasses()"
      (click)="handleClick($event)">
      <mat-spinner
        *ngIf="loading"
        [diameter]="getSpinnerSize()"
        class="button-spinner">
      </mat-spinner>
      <mat-icon *ngIf="icon && !loading" [class.icon-only]="!hasContent">{{ icon }}</mat-icon>
      <span *ngIf="hasContent" class="button-content">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [`
    button {
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

      &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .icon-only {
        margin: 0;
      }

      .button-spinner {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      &:has(.button-spinner) {
        .button-content,
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
      background: var(--color-primary);
      color: white;

      &:hover:not(:disabled) {
        background: var(--color-primary-hover);
        box-shadow: var(--shadow-md);
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
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
  @Output() clicked = new EventEmitter<MouseEvent>();

  hasContent = true;

  ngAfterContentInit() {
    // Check if button has content
    this.hasContent = true;
  }

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
