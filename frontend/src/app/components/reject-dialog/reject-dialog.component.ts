import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reject-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Reject Booking Request</h2>
    <mat-dialog-content>
      <form [formGroup]="rejectForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reason (Optional)</mat-label>
          <textarea matInput formControlName="reason" rows="4" 
                    placeholder="Enter reason for rejection..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Reject</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
    }

    mat-dialog-content {
      min-width: 350px;
      padding: 20px 0;
    }
  `]
})
export class RejectDialogComponent {
  rejectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RejectDialogComponent>
  ) {
    this.rejectForm = this.fb.group({
      reason: ['']
    });
  }

  onConfirm(): void {
    this.dialogRef.close(this.rejectForm.value.reason);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
