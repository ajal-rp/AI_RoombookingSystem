import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <button 
      mat-icon-button 
      class="back-button" 
      (click)="goBack()"
      title="Go back">
      <mat-icon>arrow_back</mat-icon>
    </button>
  `,
  styles: [`
    .back-button {
      color: var(--color-text-primary);
      transition: all var(--transition-fast);
      
      &:hover {
        background: var(--color-primary-light);
        color: var(--color-primary);
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
  `]
})
export class BackButtonComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
