import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { RoomService } from '../../services/room.service';
import { AuthService } from '../../services/auth.service';

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  status: 'Available' | 'Occupied' | 'Reserved';
  imageUrl?: string;
  description?: string;
}

interface RoomSchedule {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: string;
  currentBooking: any;
  todaysBookings: any[];
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent
  ],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  loading = true;
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  viewMode: 'grid' | 'list' = 'grid';

  // Filters
  searchQuery = '';
  selectedDate: Date | null = null;
  minCapacity: number | null = null;
  selectedStatus: string = 'all';
  selectedAmenities: string[] = [];

  availableAmenities = [
    'Projector',
    'Whiteboard',
    'Video Conference',
    'Phone',
    'TV'
  ];

  capacityOptions = [
    { label: 'Any', value: null },
    { label: '1-5 people', value: 5 },
    { label: '6-10 people', value: 10 },
    { label: '11-20 people', value: 20 },
    { label: '20+ people', value: 21 }
  ];

  constructor(
    private readonly roomService: RoomService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  addNewRoom(): void {
    this.router.navigate(['/dashboard/rooms/add']);
  }

  loadRooms(): void {
    this.loading = true;
    this.roomService.getAllRooms().subscribe({
      next: (rooms: any[]) => {
        this.rooms = rooms.map((room: any) => ({
          id: room.id,
          name: room.name,
          location: room.location || 'No location specified',
          capacity: room.capacity,
          amenities: room.amenities || this.getAmenitiesForRoom(room.id),
          status: 'Available' as 'Available' | 'Occupied' | 'Reserved',
          description: room.description || `A professional meeting space that can accommodate up to ${room.capacity} people.`
        }));
        this.filteredRooms = [...this.rooms];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading rooms:', error);
        this.loading = false;
      }
    });
  }

  getAmenitiesForRoom(roomId: number): string[] {
    // Mock amenities based on room ID - in real app, this would come from backend
    const amenitiesMap: { [key: number]: string[] } = {
      1: ['Projector', 'Whiteboard', 'Video Conference'],
      2: ['TV', 'Whiteboard'],
      3: ['Projector', 'Video Conference', 'Phone'],
    };
    return amenitiesMap[roomId] || ['Whiteboard'];
  }

  applyFilters(): void {
    this.filteredRooms = this.rooms.filter(room => {
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const matchesSearch = room.name.toLowerCase().includes(query) ||
                            room.location.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Capacity filter
      if (this.minCapacity !== null) {
        if (this.minCapacity === 21) {
          if (room.capacity < 21) return false;
        } else {
          if (room.capacity < this.minCapacity) return false;
        }
      }

      // Status filter
      if (this.selectedStatus !== 'all' && room.status !== this.selectedStatus) {
        return false;
      }

      // Amenities filter
      if (this.selectedAmenities.length > 0) {
        const hasAllAmenities = this.selectedAmenities.every(amenity =>
          room.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedDate = null;
    this.minCapacity = null;
    this.selectedStatus = 'all';
    this.selectedAmenities = [];
    this.applyFilters();
  }

  toggleAmenity(amenity: string): void {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index === -1) {
      this.selectedAmenities.push(amenity);
    } else {
      this.selectedAmenities.splice(index, 1);
    }
    this.applyFilters();
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'error' {
    switch (status) {
      case 'Available': return 'success';
      case 'Reserved': return 'warning';
      case 'Occupied': return 'error';
      default: return 'success';
    }
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

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }
}
