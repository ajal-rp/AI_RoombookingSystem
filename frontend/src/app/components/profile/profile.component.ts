import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  userProfile: UserProfile | null = null;
  isEditMode = false;
  loading = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  stats = {
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    pendingRequests: 0
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly bookingService: BookingService,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserStats();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.userService.getMyProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.initForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.snackBar.open('Error loading profile', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      firstName: [
        { value: this.userProfile?.firstName || '', disabled: !this.isEditMode },
        Validators.required
      ],
      middleName: [
        { value: this.userProfile?.middleName || '', disabled: !this.isEditMode }
      ],
      lastName: [
        { value: this.userProfile?.lastName || '', disabled: !this.isEditMode },
        Validators.required
      ],
      email: [
        { value: this.userProfile?.email || '', disabled: !this.isEditMode },
        [Validators.required, Validators.email]
      ],
      role: [
        { value: this.userProfile?.role || '', disabled: true }
      ]
    });
  }

  loadUserStats(): void {
    this.bookingService.getMyRequests().subscribe({
      next: (bookings) => {
        const now = new Date();
        this.stats.totalBookings = bookings.length;
        this.stats.upcomingBookings = bookings.filter(b => new Date(b.date) > now && b.status === 'Booked').length;
        this.stats.completedBookings = bookings.filter(b => new Date(b.date) < now && b.status === 'Booked').length;
        this.stats.pendingRequests = bookings.filter(b => b.status === 'Pending').length;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  toggleEdit(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.profileForm.get('firstName')?.enable();
      this.profileForm.get('middleName')?.enable();
      this.profileForm.get('lastName')?.enable();
      this.profileForm.get('email')?.enable();
    } else {
      this.profileForm.get('firstName')?.disable();
      this.profileForm.get('middleName')?.disable();
      this.profileForm.get('lastName')?.disable();
      this.profileForm.get('email')?.disable();
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Only images are allowed (JPG, PNG, GIF)', 'Close', { duration: 3000 });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 5MB', 'Close', { duration: 3000 });
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    if (!this.userProfile) return;

    this.loading = true;

    // First upload image if selected
    if (this.selectedFile) {
      this.userService.uploadProfileImage(this.userProfile.id, this.selectedFile).subscribe({
        next: (response) => {
          this.userProfile!.profileImageUrl = response.imageUrl;
          this.updateProfileInfo();
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.snackBar.open('Error uploading image', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.updateProfileInfo();
    }
  }

  private updateProfileInfo(): void {
    if (!this.userProfile) return;

    const updateRequest = {
      firstName: this.profileForm.value.firstName,
      middleName: this.profileForm.value.middleName || null,
      lastName: this.profileForm.value.lastName,
      email: this.profileForm.value.email
    };

    this.userService.updateProfile(this.userProfile.id, updateRequest).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.isEditMode = false;
        this.selectedFile = null;
        this.imagePreview = null;
        this.initForm();
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.snackBar.open(error.error?.message || 'Error updating profile', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedFile = null;
    this.imagePreview = null;
    this.initForm();
  }

  getProfileImageUrl(): string {
    if (this.imagePreview) {
      return this.imagePreview;
    }
    if (this.userProfile?.profileImageUrl) {
      return `${environment.apiUrl.replace('/api', '')}${this.userProfile.profileImageUrl}`;
    }
    return '';
  }

  getInitials(): string {
    if (!this.userProfile) return '';
    const firstName = this.userProfile.firstName || '';
    const lastName = this.userProfile.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  changePassword(): void {
    this.snackBar.open('Password change feature coming soon', 'Close', { duration: 3000 });
  }
}
