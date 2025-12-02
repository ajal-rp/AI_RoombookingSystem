import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { forkJoin } from 'rxjs';

interface UpcomingMeeting {
  id: number;
  roomName: string;
  startTime: Date;
  endTime: Date;
  purpose: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  
  kpiData = {
    totalRooms: 0,
    availableNow: 0,
    pendingRequests: 0,
    todaysMeetings: 0
  };

  upcomingDays: Date[] = [];
  upcomingMeetings: UpcomingMeeting[] = [];

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService
  ) {
    this.generateUpcomingDays();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      rooms: this.roomService.getRooms(),
      schedule: this.roomService.getRoomSchedules(),
      requests: this.bookingService.getBookingRequests()
    }).subscribe({
      next: (data: any) => {
        console.log('Dashboard data received:', data);
        
        // Extract the actual data array from paginated response
        const requestsData = data.requests.data || data.requests || [];
        
        console.log('Requests data:', requestsData);
        console.log('Rooms:', data.rooms);
        console.log('Schedule:', data.schedule);
        
        // Calculate KPIs
        this.kpiData.totalRooms = data.rooms.length;
        this.kpiData.availableNow = data.schedule.filter((s: any) => s.status === 'Available').length;
        this.kpiData.pendingRequests = requestsData.filter((r: any) => r.status === 'Pending').length;
        
        // Calculate today's meetings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        this.kpiData.todaysMeetings = requestsData.filter((r: any) => {
          const bookingDate = new Date(r.date);
          return bookingDate >= today && bookingDate < tomorrow && r.status === 'Booked';
        }).length;

        // Get upcoming meetings
        this.upcomingMeetings = requestsData
          .filter((r: any) => {
            const startDateTime = new Date(`${r.date}T${r.startTime}`);
            return startDateTime >= new Date() && r.status === 'Booked';
          })
          .sort((a: any, b: any) => {
            const aTime = new Date(`${a.date}T${a.startTime}`);
            const bTime = new Date(`${b.date}T${b.startTime}`);
            return aTime.getTime() - bTime.getTime();
          })
          .slice(0, 5)
          .map((r: any) => ({
            id: r.id,
            roomName: r.roomName || 'N/A',
            startTime: new Date(`${r.date}T${r.startTime}`),
            endTime: new Date(`${r.date}T${r.endTime}`),
            purpose: r.purpose || 'No purpose specified',
            status: r.status
          }));

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading dashboard data:', err);
        this.loading = false;
      }
    });
  }

  generateUpcomingDays(): void {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      this.upcomingDays.push(day);
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getDayNumber(date: Date): number {
    return date.getDate();
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusVariant(status: string): 'success' | 'pending' | 'error' | 'warning' {
    switch (status.toLowerCase()) {
      case 'booked': return 'success';
      case 'pending': return 'pending';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  }
}
