import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-add-room',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-room.component.html',
  styleUrl: './add-room.component.scss'
})
export class AddRoomComponent {
  roomForm: FormGroup;
  isSubmitting = false;
  amenities: string[] = [];
  amenityInput = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly roomService: RoomService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      location: ['', [Validators.required, Validators.maxLength(200)]],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      description: ['', [Validators.maxLength(500)]],
      amenityInput: ['']
    });
  }

  addAmenity(): void {
    const input = this.roomForm.get('amenityInput')?.value?.trim();
    if (input && !this.amenities.includes(input)) {
      this.amenities.push(input);
      this.roomForm.patchValue({ amenityInput: '' });
    }
  }

  removeAmenity(amenity: string): void {
    const index = this.amenities.indexOf(amenity);
    if (index >= 0) {
      this.amenities.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      Object.keys(this.roomForm.controls).forEach(key => {
        this.roomForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const roomData = {
      name: this.roomForm.value.name,
      location: this.roomForm.value.location,
      capacity: parseInt(this.roomForm.value.capacity),
      description: this.roomForm.value.description || null,
      amenities: this.amenities
    };

    this.roomService.createRoom(roomData).subscribe({
      next: (room) => {
        this.snackBar.open('Room created successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard/rooms']);
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error.message || 'Failed to create room';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/rooms']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.roomForm.get(fieldName);
    if (!control?.errors || !control.touched) return '';

    if (control.errors['required']) return `${fieldName} is required`;
    if (control.errors['maxLength']) return `Maximum ${control.errors['maxLength'].requiredLength} characters`;
    if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
    if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;

    return '';
  }
}
