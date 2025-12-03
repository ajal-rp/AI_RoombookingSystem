import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';

interface RoomDetails {
  id: number;
  name: string;
  location: string;
  capacity: number;
  description: string;
  amenities: string[];
  status: string;
  imageUrl: string;
}

interface Booking {
  id: number;
  employeeName: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
}

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTabsModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent
  ],
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.scss']
})
export class RoomDetailsComponent implements OnInit, OnDestroy {
  roomId!: number;
  room: RoomDetails | null = null;
  upcomingBookings: Booking[] = [];
  loading = true;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly roomService: RoomService,
    private readonly bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.roomId = +params['id'];
        this.loadRoomDetails();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoomDetails(): void {
    this.loading = true;
    // Mock data for now - in real app, fetch from API
    setTimeout(() => {
      this.room = {
        id: this.roomId,
        name: 'Conference Room ' + this.roomId,
        location: 'Building A, Floor ' + (this.roomId % 5 + 1),
        capacity: 10 + (this.roomId * 2),
        description: 'A modern, well-equipped conference room perfect for team meetings, presentations, and collaborative work sessions. Features natural lighting, ergonomic seating, and state-of-the-art technology.',
        amenities: ['Projector', 'Whiteboard', 'Video Conference', 'Phone', 'TV'],
        status: 'Available',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
      };

      this.upcomingBookings = [
        {
          id: 1,
          employeeName: 'John Doe',
          date: new Date(),
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          purpose: 'Team Standup',
          status: 'Booked'
        },
        {
          id: 2,
          employeeName: 'Jane Smith',
          date: new Date(Date.now() + 86400000),
          startTime: '2:00 PM',
          endTime: '3:30 PM',
          purpose: 'Client Meeting',
          status: 'Booked'
        }
      ];

      this.loading = false;
    }, 500);
  }

  getAmenityIcon(amenity: string): string {
    const icons: { [key: string]: string } = {
      'Projector': 'settings_input_hdmi',
      'Whiteboard': 'border_color',
      'Video Conference': 'videocam',
      'Phone': 'phone',
      'TV': 'tv'
    };
    return icons[amenity] || 'check_circle';
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'error' {
    switch (status.toLowerCase()) {
      case 'available': return 'success';
      case 'reserved': return 'warning';
      case 'occupied': return 'error';
      default: return 'success';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
}
