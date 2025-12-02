import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
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
export class EmployeeDashboardComponent implements OnInit {
  loading = true;
  user: any;

  kpiData = {
    myBookings: 0,
    upcomingMeetings: 0,
    pendingRequests: 0,
    completedToday: 0
  };

  upcomingMeetings: UpcomingMeeting[] = [];
  recentActivity: any[] = [];

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
    this.loadEmployeeData();
  }

  loadEmployeeData(): void {
    this.loading = true;

    this.bookingService.getMyRequests().subscribe({
      next: (bookings) => {
        console.log('Employee bookings received:', bookings);
        
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Calculate KPIs
        this.kpiData.myBookings = bookings.filter(b => b.status === 'Booked').length;
        this.kpiData.upcomingMeetings = bookings.filter(b => {
          const bookingDateTime = new Date(`${b.date}T${b.startTime}`);
          return bookingDateTime > now && b.status === 'Booked';
        }).length;
        this.kpiData.pendingRequests = bookings.filter(b => b.status === 'Pending').length;
        this.kpiData.completedToday = bookings.filter(b => {
          const bookingDate = new Date(b.date);
          const endDateTime = new Date(`${b.date}T${b.endTime}`);
          return bookingDate >= today && bookingDate < tomorrow && 
                 endDateTime < now &&
                 b.status === 'Booked';
        }).length;

        // Get upcoming meetings
        this.upcomingMeetings = bookings
          .filter(b => {
            const bookingDateTime = new Date(`${b.date}T${b.startTime}`);
            return bookingDateTime >= now && b.status === 'Booked';
          })
          .sort((a, b) => {
            const aTime = new Date(`${a.date}T${a.startTime}`);
            const bTime = new Date(`${b.date}T${b.startTime}`);
            return aTime.getTime() - bTime.getTime();
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

        // Get recent activity (last 5 bookings)
        this.recentActivity = bookings
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
        console.error('Error loading employee data:', error);
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
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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

