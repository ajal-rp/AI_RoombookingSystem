import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserProfile, CreateUserRequest, UpdateProfileRequest } from '../../models/auth.model';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    ButtonComponent
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss']
})
export class UserFormDialogComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;

  roles = [
    { value: 'Admin', label: 'Administrator' },
    { value: 'Employee', label: 'Employee' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: UserProfile }
  ) {
    this.isEditMode = !!data?.user;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    if (this.isEditMode && this.data.user) {
      // Edit mode - no password field
      this.userForm = this.fb.group({
        firstName: [this.data.user.firstName, [Validators.required, Validators.minLength(2)]],
        middleName: [this.data.user.middleName || ''],
        lastName: [this.data.user.lastName, [Validators.required, Validators.minLength(2)]],
        email: [this.data.user.email, [Validators.required, Validators.email]],
        username: [{ value: this.data.user.username, disabled: true }],
        role: [{ value: this.data.user.role, disabled: true }]
      });
    } else {
      // Add mode - include password field
      this.userForm = this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        middleName: [''],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        role: ['Employee', Validators.required]
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (field.hasError('email')) {
      return 'Invalid email format';
    }

    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      role: 'Role'
    };
    return labels[fieldName] || fieldName;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      if (this.isEditMode) {
        const updateData: UpdateProfileRequest = {
          firstName: this.userForm.get('firstName')?.value,
          middleName: this.userForm.get('middleName')?.value || undefined,
          lastName: this.userForm.get('lastName')?.value,
          email: this.userForm.get('email')?.value
        };
        this.dialogRef.close(updateData);
      } else {
        const createData: CreateUserRequest = this.userForm.value;
        this.dialogRef.close(createData);
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
