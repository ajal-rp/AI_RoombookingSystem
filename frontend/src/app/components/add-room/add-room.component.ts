import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RoomService } from '../../services/room.service';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { environment } from '../../../environments/environment';

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
    MatProgressSpinnerModule,
    MatTooltipModule,
    BackButtonComponent,
    ButtonComponent,
    CardComponent
  ],
  templateUrl: './add-room.component.html',
  styleUrl: './add-room.component.scss'
})
export class AddRoomComponent implements OnInit {
  roomForm: FormGroup;
  saving = false;
  isEditMode = false;
  roomId: number | null = null;
  selectedAmenities: string[] = [];
  uploadedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  uploadingImage = false;

  availableAmenities = [
    'Projector',
    'Whiteboard',
    'Video Conference',
    'Phone',
    'TV',
    'Air Conditioning',
    'WiFi',
    'Smart Board'
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly roomService: RoomService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly http: HttpClient
  ) {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9\s\-]+$/)]],
      location: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(1000), Validators.pattern(/^[0-9]+$/)]],
      description: ['', [Validators.maxLength(500)]],
      imageUrls: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.roomId = parseInt(id, 10);
      this.loadRoom();
    }
  }

  get imageUrlControls(): FormArray {
    return this.roomForm.get('imageUrls') as FormArray;
  }

  loadRoom(): void {
    if (!this.roomId) return;

    this.roomService.getRoomById(this.roomId).subscribe({
      next: (room: any) => {
        this.roomForm.patchValue({
          name: room.name,
          location: room.location,
          capacity: room.capacity,
          description: room.description
        });
        
        this.selectedAmenities = room.amenities || [];
        
        // Load image URLs
        if (room.imageUrls && room.imageUrls.length > 0) {
          room.imageUrls.forEach((url: string) => {
            this.imageUrlControls.push(new FormControl(url));
          });
        }
      },
      error: (error) => {
        this.snackBar.open('Failed to load room details', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/rooms']);
      }
    });
  }

  toggleAmenity(amenity: string): void {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index === -1) {
      this.selectedAmenities.push(amenity);
    } else {
      this.selectedAmenities.splice(index, 1);
    }
  }

  addImageUrl(): void {
    this.imageUrlControls.push(new FormControl('', [Validators.pattern(/^https?:\/\/.+/)]));
  }

  removeImageUrl(index: number): void {
    this.imageUrlControls.removeAt(index);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    
    // Validate file types and sizes
    for (const file of files) {
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        this.snackBar.open('Only image files (JPEG, PNG, GIF, WebP) are allowed', 'Close', { duration: 3000 });
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.snackBar.open(`File ${file.name} is too large. Maximum size is 5MB`, 'Close', { duration: 3000 });
        continue;
      }

      this.uploadedImages.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset input
    input.value = '';
  }

  removeUploadedImage(index: number): void {
    this.uploadedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  async uploadImages(): Promise<string[]> {
    if (this.uploadedImages.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (const file of this.uploadedImages) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response: any = await this.http.post(
          `${environment.apiUrl}/api/upload/image`,
          formData
        ).toPromise();
        
        if (response?.url) {
          uploadedUrls.push(response.url);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        this.snackBar.open(`Failed to upload ${file.name}`, 'Close', { duration: 3000 });
      }
    }
    
    return uploadedUrls;
  }

  getAmenityIcon(amenity: string): string {
    const icons: { [key: string]: string } = {
      'Projector': 'settings_input_hdmi',
      'Whiteboard': 'border_color',
      'Video Conference': 'videocam',
      'Phone': 'phone',
      'TV': 'tv',
      'Air Conditioning': 'ac_unit',
      'WiFi': 'wifi',
      'Smart Board': 'touch_app'
    };
    return icons[amenity] || 'check_circle';
  }

  async onSubmit(): Promise<void> {
    if (this.roomForm.invalid) {
      Object.keys(this.roomForm.controls).forEach(key => {
        this.roomForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Please fix all validation errors', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;

    try {
      // Upload images first if any
      let uploadedImageUrls: string[] = [];
      if (this.uploadedImages.length > 0) {
        this.uploadingImage = true;
        uploadedImageUrls = await this.uploadImages();
        this.uploadingImage = false;
      }

      // Combine uploaded images with URL images
      const urlImages = this.imageUrlControls.value.filter((url: string) => url && url.trim());
      const allImageUrls = [...uploadedImageUrls, ...urlImages];

      const roomData = {
        name: this.roomForm.value.name.trim(),
        location: this.roomForm.value.location.trim(),
        capacity: Number.parseInt(this.roomForm.value.capacity),
        description: this.roomForm.value.description?.trim() || null,
        amenities: this.selectedAmenities,
        imageUrls: allImageUrls.length > 0 ? allImageUrls : null
      };

      const request = this.isEditMode && this.roomId
        ? this.roomService.updateRoom(this.roomId, roomData)
        : this.roomService.createRoom(roomData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            this.isEditMode ? 'Room updated successfully!' : 'Room created successfully!',
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['/dashboard/rooms']);
        },
        error: (error) => {
          this.saving = false;
          const errorMessage = error.error?.message || 'An error occurred';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    } catch (error) {
      this.saving = false;
      this.uploadingImage = false;
      this.snackBar.open('Failed to process images', 'Close', { duration: 5000 });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.roomForm.get(fieldName);
    if (!field || !field.touched || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) {
      if (fieldName === 'name') return 'Only letters, numbers, spaces, and hyphens allowed';
      if (fieldName === 'capacity') return 'Only numbers allowed';
      return 'Invalid format';
    }
    
    return '';
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/rooms']);
  }
}
