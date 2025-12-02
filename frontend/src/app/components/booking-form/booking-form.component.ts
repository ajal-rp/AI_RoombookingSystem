import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    ButtonComponent,
    CardComponent
  ],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  rooms: Room[] = [];
  selectedRoom: Room | null = null;
  loading = false;
  submitting = false;
  minDate = new Date();
  isEditMode = false;
  bookingId: number | null = null;

  // Time slots (9 AM to 6 PM, 30 min intervals)
  timeSlots: string[] = [];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadRooms();

    // Check if this is edit mode
    const bookingId = this.route.snapshot.params['id'];
    if (bookingId) {
      this.isEditMode = true;
      this.bookingId = +bookingId;
      this.loadBooking(this.bookingId);
    } else {
      // Check if room ID is provided in query params (for new booking)
      const roomId = this.route.snapshot.queryParams['roomId'];
      if (roomId) {
        this.bookingForm.patchValue({ roomId: +roomId });
      }
    }
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      roomId: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      purpose: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      attendees: ['', Validators.min(1)],
      notes: ['', Validators.maxLength(1000)]
    });

    // Watch for room changes
    this.bookingForm.get('roomId')?.valueChanges.subscribe(roomId => {
      this.selectedRoom = this.rooms.find(r => r.id === +roomId) || null;
    });

    // Add custom validators for time
    this.bookingForm.get('startTime')?.valueChanges.subscribe(() => this.validateTimes());
    this.bookingForm.get('endTime')?.valueChanges.subscribe(() => this.validateTimes());
    
    // Watch for date changes to update formatted date
    this.bookingForm.get('date')?.valueChanges.subscribe(() => {
      // Trigger change detection by updating a property
    });
  }

  validateTimes(): void {
    const startTime = this.bookingForm.get('startTime')?.value;
    const endTime = this.bookingForm.get('endTime')?.value;

    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const durationMinutes = endMinutes - startMinutes;

      if (durationMinutes < 30) {
        this.bookingForm.get('endTime')?.setErrors({ minDuration: true });
      } else if (durationMinutes > 480) { // 8 hours
        this.bookingForm.get('endTime')?.setErrors({ maxDuration: true });
      }
    }
  }

  loadRooms(): void {
    this.loading = true;
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;

        // If roomId was set before rooms loaded, update selected room
        const currentRoomId = this.bookingForm.get('roomId')?.value;
        if (currentRoomId) {
          this.selectedRoom = this.rooms.find(r => r.id === +currentRoomId) || null;
        }
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.snackBar.open('Failed to load rooms', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadBooking(id: number): void {
    this.loading = true;
    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        this.bookingForm.patchValue({
          roomId: booking.roomId,
          date: new Date(booking.date),
          startTime: booking.startTime,
          endTime: booking.endTime,
          purpose: booking.purpose,
          attendees: booking.attendees,
          notes: booking.notes
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.snackBar.open('Failed to load booking details', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/requests']);
      }
    });
  }

  generateTimeSlots(): void {
    for (let hour = 8; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === 18 && min > 0) break; // Stop at 6:00 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        this.timeSlots.push(timeString);
      }
    }
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      Object.keys(this.bookingForm.controls).forEach(key => {
        this.bookingForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.submitting = true;
    const formValue = this.bookingForm.value;

    // Format the request
    const request = {
      roomId: +formValue.roomId,
      date: this.formatDate(formValue.date),
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      purpose: formValue.purpose,
      attendees: formValue.attendees || 1,
      notes: formValue.notes || ''
    };

    const action$ = this.isEditMode && this.bookingId
      ? this.bookingService.updateBookingRequest(this.bookingId, request)
      : this.bookingService.createBookingRequest(request);

    action$.subscribe({
      next: () => {
        const message = this.isEditMode 
          ? 'Booking updated successfully!' 
          : 'Booking request submitted successfully!';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/requests']);
      },
      error: (error) => {
        console.error('Error submitting booking:', error);
        this.submitting = false;

        // Handle validation errors from backend
        if (error.status === 400 && error.error?.errors) {
          const validationErrors = error.error.errors;
          let errorMessage = 'Validation failed:\n';
          
          // Check if it's FluentValidation format
          if (Array.isArray(validationErrors)) {
            validationErrors.forEach((err: any) => {
              errorMessage += `• ${err.errorMessage}\n`;
              // Mark the corresponding form field as invalid
              const fieldName = err.propertyName?.charAt(0).toLowerCase() + err.propertyName?.slice(1);
              if (fieldName && this.bookingForm.get(fieldName)) {
                this.bookingForm.get(fieldName)?.setErrors({ backend: err.errorMessage });
              }
            });
          } else {
            // Handle other validation error formats
            Object.keys(validationErrors).forEach(key => {
              const fieldErrors = validationErrors[key];
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach(msg => errorMessage += `• ${msg}\n`);
              }
            });
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 8000 });
        } else {
          const message = error.error?.message || error.error?.title || 'Failed to submit booking request';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/rooms']);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  get duration(): string {
    const start = this.bookingForm.get('startTime')?.value;
    const end = this.bookingForm.get('endTime')?.value;
    if (!start || !end) return '';

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = endMinutes - startMinutes;

    if (durationMinutes <= 0) return 'Invalid duration';

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  get formattedDate(): string {
    const date = this.bookingForm.get('date')?.value;
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    if (!field || !field.touched || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['backend']) return errors['backend'];
    if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['min'].min}`;
    if (errors['minDuration']) return 'Booking must be at least 30 minutes long';
    if (errors['maxDuration']) return 'Booking cannot exceed 8 hours';
    
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      roomId: 'Room',
      date: 'Date',
      startTime: 'Start time',
      endTime: 'End time',
      purpose: 'Purpose',
      attendees: 'Number of attendees',
      notes: 'Notes'
    };
    return labels[fieldName] || fieldName;
  }
}
