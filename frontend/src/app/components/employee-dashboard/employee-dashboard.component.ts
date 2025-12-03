import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

interface UpcomingMeeting {
  id: number;
  roomName: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    KpiCardComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  loading = true;
  user: any;
  private readonly destroy$ = new Subject<void>();

  kpiData = {
    myBookings: 0,
    upcomingMeetings: 0,
    pendingRequests: 0,
    completedToday: 0
  };

  upcomingMeetings: UpcomingMeeting[] = [];
  recentActivity: any[] = [];

  constructor(
    private readonly bookingService: BookingService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
      });
    this.loadEmployeeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployeeData(): void {
    this.loading = true;

    this.bookingService.getMyRequests().subscribe({
      next: (bookings) => {
        // Pre-calculate time boundaries once
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);

        // Single-pass calculation for all metrics
        let bookedCount = 0;
        let upcomingCount = 0;
        let pendingCount = 0;
        let completedTodayCount = 0;
        const upcomingBookings: any[] = [];

        for (const b of bookings) {
          const status = b.status;
          const bookingDate = new Date(b.date);
          const startDateTime = new Date(`${b.date}T${b.startTime}`);
          const endDateTime = new Date(`${b.date}T${b.endTime}`);

          // Count by status
          if (status === 'Pending') {
            pendingCount++;
          } else if (status === 'Booked') {
            bookedCount++;

            // Check if upcoming
            if (startDateTime > now) {
              upcomingCount++;
              upcomingBookings.push(b);
            }

            // Check if completed today
            if (bookingDate >= todayStart && bookingDate < tomorrowStart && endDateTime < now) {
              completedTodayCount++;
            }
          }
        }

        // Set KPIs
        this.kpiData.myBookings = bookedCount;
        this.kpiData.upcomingMeetings = upcomingCount;
        this.kpiData.pendingRequests = pendingCount;
        this.kpiData.completedToday = completedTodayCount;

        // Sort and map upcoming meetings (already filtered)
        this.upcomingMeetings = upcomingBookings
          .toSorted((a, b) => {
            const aTime = new Date(`${a.date}T${a.startTime}`).getTime();
            const bTime = new Date(`${b.date}T${b.startTime}`).getTime();
            return aTime - bTime;
          })
          .slice(0, 5)
          .map(b => ({
            id: b.id,
            roomName: b.roomName || 'N/A',
            date: new Date(b.date),
            startTime: b.startTime,
            endTime: b.endTime,
            purpose: b.purpose || 'No purpose specified',
            status: b.status
          }));

        // Get recent activity (last 5 bookings by date)
        this.recentActivity = bookings
          .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map(b => ({
            id: b.id,
            roomName: b.roomName,
            date: new Date(b.date),
            status: b.status,
            action: this.getActionText(b.status)
          }));

        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  private getActionText(status: string): string {
    switch (status) {
      case 'Pending': return 'Booking requested';
      case 'Booked': return 'Booking confirmed';
      case 'Rejected': return 'Request rejected';
      case 'Cancelled': return 'Booking cancelled';
      default: return 'Unknown action';
    }
  }

  formatDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  formatTime(time: string): string {
    // Convert 24h to 12h format
    const [hours, minutes] = time.split(':');
    const hour = Number.parseInt(hours);
    const displayHour = hour % 12 || 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minutes} ${period}`;
  }

  getStatusClass(status: string): 'success' | 'pending' | 'error' | 'warning' {
    switch (status) {
      case 'Booked': return 'success';
      case 'Pending': return 'pending';
      case 'Rejected': return 'error';
      case 'Cancelled': return 'warning';
      default: return 'pending';
    }
  }
}

