import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatChipsModule } from "@angular/material/chips";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { AuthService } from "../../services/auth.service";
import { BookingService } from "../../services/booking.service";
import { BookingRequest } from "../../models/booking.model";
import { RejectDialogComponent } from "../reject-dialog/reject-dialog.component";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Admin Dashboard</span>
      <span class="spacer"></span>
      <span>{{ currentUser?.fullName }}</span>
      <button mat-icon-button (click)="logout()">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Pending Booking Requests</mat-card-title>
          <button mat-icon-button (click)="loadPendingRequests()">
            <mat-icon>refresh</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="pendingRequests" class="full-width">
            <ng-container matColumnDef="employeeName">
              <th mat-header-cell *matHeaderCellDef>Employee</th>
              <td mat-cell *matCellDef="let request">
                {{ request.employeeName }}
              </td>
            </ng-container>

            <ng-container matColumnDef="roomName">
              <th mat-header-cell *matHeaderCellDef>Room</th>
              <td mat-cell *matCellDef="let request">{{ request.roomName }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let request">
                {{ request.date | date : "shortDate" }}
              </td>
            </ng-container>

            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>Time</th>
              <td mat-cell *matCellDef="let request">
                {{ formatTime(request.startTime) }} -
                {{ formatTime(request.endTime) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Requested At</th>
              <td mat-cell *matCellDef="let request">
                {{ request.createdAt | date : "short" }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let request">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="confirmRequest(request.id)"
                  class="action-btn"
                >
                  Confirm
                </button>
                <button
                  mat-raised-button
                  color="warn"
                  (click)="openRejectDialog(request.id)"
                  class="action-btn"
                >
                  Reject
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <div *ngIf="pendingRequests.length === 0" class="no-data">
            No pending booking requests
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
      }

      table {
        width: 100%;
      }

      .no-data {
        text-align: center;
        padding: 40px;
        color: #999;
        font-size: 16px;
      }

      .action-btn {
        margin-right: 8px;
      }

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      mat-card-content {
        overflow-x: auto;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  pendingRequests: BookingRequest[] = [];
  currentUser = this.authService.currentUserValue;
  displayedColumns = [
    "employeeName",
    "roomName",
    "date",
    "time",
    "createdAt",
    "actions",
  ];

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const token: string | null = localStorage.getItem("token");
    console.log("Admin Dashboard initialized. Token:", token);
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.bookingService.getPendingRequests().subscribe({
      next: (requests) => (this.pendingRequests = requests),
      error: (error) =>
        this.snackBar.open("Failed to load pending requests", "Close", {
          duration: 3000,
        }),
    });
  }

  confirmRequest(id: number): void {
    this.bookingService.confirmRequest(id).subscribe({
      next: () => {
        this.snackBar.open("Booking request confirmed", "Close", {
          duration: 3000,
        });
        this.loadPendingRequests();
      },
      error: (error) => {
        const message = error.error?.message || "Failed to confirm request";
        this.snackBar.open(message, "Close", { duration: 5000 });
      },
    });
  }

  openRejectDialog(id: number): void {
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: "400px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.rejectRequest(id, result);
      }
    });
  }

  rejectRequest(id: number, reason: string): void {
    this.bookingService.rejectRequest(id, { rejectReason: reason }).subscribe({
      next: () => {
        this.snackBar.open("Booking request rejected", "Close", {
          duration: 3000,
        });
        this.loadPendingRequests();
      },
      error: (error) => {
        const message = error.error?.message || "Failed to reject request";
        this.snackBar.open(message, "Close", { duration: 5000 });
      },
    });
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  logout(): void {
    this.authService.logout();
  }
}
