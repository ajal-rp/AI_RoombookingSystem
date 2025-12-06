import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { BookingService } from '../../services/booking.service';
import { BookingRequest } from '../../models/booking.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: BookingRequest[];
  bookingCount: number;
}

interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  bookings: BookingRequest[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule,
    MatTooltipModule,
    ButtonComponent, 
    CardComponent, 
    BadgeComponent,
    BackButtonComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth = '';
  currentYear = 0;
  calendarDays: CalendarDay[] = [];
  weekDays: WeekDay[] = [];
  weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  viewMode: 'month' | 'week' = 'month';
  loading = false;
  allBookings: BookingRequest[] = [];
  selectedDay: CalendarDay | null = null;

  constructor(private readonly bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingService.getBookingRequests(undefined, undefined, undefined, 1, 1000).subscribe({
      next: (response: any) => {
        this.allBookings = response.data || [];
        this.updateCalendar();
        this.generateWeekView();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.allBookings = [];
        this.updateCalendar();
        this.loading = false;
      }
    });
  }

  updateCalendar(): void {
    this.currentMonth = this.currentDate.toLocaleDateString('en-US', { month: 'long' });
    this.currentYear = this.currentDate.getFullYear();
    this.calendarDays = this.generateCalendarDays();
  }

  generateCalendarDays(): CalendarDay[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dayBookings = this.getBookingsForDate(date);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        bookings: dayBookings,
        bookingCount: dayBookings.length
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayBookings = this.getBookingsForDate(date);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        bookings: dayBookings,
        bookingCount: dayBookings.length
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dayBookings = this.getBookingsForDate(date);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        bookings: dayBookings,
        bookingCount: dayBookings.length
      });
    }

    return days;
  }

  generateWeekView(): void {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const days: WeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      days.push({
        date: new Date(date),
        dayName: this.weekDayNames[i],
        dayNumber: date.getDate(),
        isToday: this.isToday(date),
        bookings: this.getBookingsForDate(date)
      });
    }

    this.weekDays = days;
  }

  getBookingsForDate(date: Date): BookingRequest[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return this.allBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === targetDate.getTime();
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.updateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.updateCalendar();
  }

  previousWeek(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() - 7);
    this.currentDate = newDate;
    this.generateWeekView();
  }

  nextWeek(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + 7);
    this.currentDate = newDate;
    this.generateWeekView();
  }

  toggleView(): void {
    this.viewMode = this.viewMode === 'month' ? 'week' : 'month';
    if (this.viewMode === 'week') {
      this.generateWeekView();
    }
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay = day;
  }

  closeDetails(): void {
    this.selectedDay = null;
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.updateCalendar();
    if (this.viewMode === 'week') {
      this.generateWeekView();
    }
  }

  getDayNumber(day: CalendarDay): number {
    return day.date.getDate();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Booked': return '#10b981';
      case 'Pending': return '#f59e0b';
      case 'Rejected': return '#ef4444';
      default: return '#6b7280';
    }
  }

  formatTime(timeString: string): string {
    return timeString;
  }

  getBookingCountColor(count: number): string {
    if (count === 0) return 'transparent';
    if (count <= 2) return '#dbeafe';
    if (count <= 4) return '#93c5fd';
    return '#3b82f6';
  }

  get weekRange(): string {
    if (this.weekDays.length === 0) return '';
    const start = this.weekDays[0].date;
    const end = this.weekDays[6].date;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  }
}
