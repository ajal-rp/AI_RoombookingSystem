import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { BookingService } from '../../services/booking.service';
import { BookingRequest } from '../../models/booking.model';
import { AuthService } from '../../services/auth.service';
import { RejectDialogComponent } from '../reject-dialog/reject-dialog.component';

export type FilterStatus = 'all' | 'Pending' | 'Booked' | 'Rejected';
export type FilterTime = 'all' | 'today' | 'upcoming' | 'past';

@Component({
  selector: 'app-requests-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    BackButtonComponent
  ],
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss']
})
export class RequestsListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'employeeName', 'roomName', 'date', 'time', 'purpose', 'status', 'actions'];
  dataSource: MatTableDataSource<BookingRequest>;
  loading = false;
  isAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filters
  statusFilter: FilterStatus = 'all';
  timeFilter: FilterTime = 'all';
  searchQuery = '';

  allRequests: BookingRequest[] = [];

  constructor(
    private readonly bookingService: BookingService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {
    this.isAdmin = this.authService.isAdmin;
    this.dataSource = new MatTableDataSource<BookingRequest>([]);
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadRequests(): void {
    this.loading = true;
    
    if (this.isAdmin) {
      this.bookingService.getBookingRequests(undefined, undefined, undefined, 1, 1000).subscribe({
        next: (response: any) => {
          this.allRequests = response.data || [];
          this.applyFilters();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading requests:', error);
          this.snackBar.open('Failed to load booking requests', 'Close', { duration: 3000 });
          this.allRequests = [];
          this.dataSource.data = [];
          this.loading = false;
        }
      });
    } else {
      this.bookingService.getMyRequests().subscribe({
        next: (response: BookingRequest[]) => {
          this.allRequests = response;
          this.applyFilters();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading requests:', error);
          this.snackBar.open('Failed to load booking requests', 'Close', { duration: 3000 });
          this.allRequests = [];
          this.dataSource.data = [];
          this.loading = false;
        }
      });
    }
  }

  applyFilters(): void {
    const filtered = this.allRequests.filter((request: BookingRequest) => 
      this.matchesStatusFilter(request) &&
      this.matchesTimeFilter(request) &&
      this.matchesSearchQuery(request)
    );

    this.dataSource.data = filtered;
  }

  private matchesStatusFilter(request: BookingRequest): boolean {
    return this.statusFilter === 'all' || request.status === this.statusFilter;
  }

  private matchesTimeFilter(request: BookingRequest): boolean {
    if (this.timeFilter === 'all') return true;

    const requestDate = new Date(request.startTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (this.timeFilter) {
      case 'today': {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return requestDate >= today && requestDate < tomorrow;
      }
      case 'upcoming':
        return requestDate >= new Date();
      case 'past':
        return requestDate < new Date();
      default:
        return true;
    }
  }

  private matchesSearchQuery(request: BookingRequest): boolean {
    if (!this.searchQuery) return true;

    const query = this.searchQuery.toLowerCase();
    return (
      request.employeeName?.toLowerCase().includes(query) ||
      request.roomName?.toLowerCase().includes(query) ||
      request.purpose?.toLowerCase().includes(query) ||
      false
    );
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status as FilterStatus;
    this.applyFilters();
  }

  onTimeFilterChange(time: string): void {
    this.timeFilter = time as FilterTime;
    this.applyFilters();
  }

  getFilterCount(filter: string, type: 'status' | 'time'): number {
    if (type === 'status') {
      if (filter === 'all') return this.allRequests.length;
      return this.allRequests.filter(r => r.status === filter).length;
    }
    return 0;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = Number.parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getStatusVariant(status: string): 'success' | 'pending' | 'error' | 'warning' {
    switch (status) {
      case 'Booked': return 'success';
      case 'Pending': return 'pending';
      case 'Rejected': return 'error';
      default: return 'warning';
    }
  }

  confirmRequest(id: number): void {
    this.bookingService.confirmRequest(id).subscribe({
      next: () => {
        this.snackBar.open('Booking request approved successfully', 'Close', { duration: 3000 });
        this.loadRequests();
      },
      error: (error: any) => {
        this.snackBar.open('Failed to approve booking request', 'Close', { duration: 3000 });
      }
    });
  }

  rejectRequest(id: number): void {
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '500px',
      data: { requestId: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadRequests();
      }
    });
  }

  editRequest(id: number): void {
    this.router.navigate(['/dashboard/book-room'], { queryParams: { edit: id } });
  }

  deleteRequest(id: number): void {
    if (confirm('Are you sure you want to delete this booking request?')) {
      this.bookingService.deleteBookingRequest(id).subscribe({
        next: () => {
          this.snackBar.open('Booking request deleted successfully', 'Close', { duration: 3000 });
          this.loadRequests();
        },
        error: (error: any) => {
          this.snackBar.open('Failed to delete booking request', 'Close', { duration: 3000 });
        }
      });
    }
  }

  refreshData(): void {
    this.loadRequests();
  }
}
