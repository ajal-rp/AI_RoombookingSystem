import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CardComponent } from '../../shared/components/card/card.component';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

interface BookingData {
  employeeName: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
}

interface RoomData {
  id: number;
  name: string;
  location: string;
  capacity: number;
  bookings?: BookingData[];
}

interface RoomSchedule {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentStatus: 'Available' | 'Occupied' | 'Reserved';
  currentBooking?: {
    employeeName: string;
    startTime: string;
    endTime: string;
    purpose: string;
  };
  nextBooking?: {
    employeeName: string;
    startTime: string;
    purpose: string;
  };
  todayBookingsCount: number;
}

@Component({
  selector: 'app-rooms-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    CardComponent,
    BackButtonComponent
  ],
  templateUrl: './rooms-schedule.component.html',
  styleUrls: ['./rooms-schedule.component.scss']
})
export class RoomsScheduleComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'location', 'capacity', 'currentStatus', 'currentBooking', 'nextBooking', 'todayBookingsCount'];
  dataSource: MatTableDataSource<RoomSchedule>;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Old AG Grid configuration - kept for reference but not used
  oldColumnDefs_removed: Array<{
    field: string;
    headerName: string;
    filter?: boolean;
    floatingFilter?: boolean;
    minWidth?: number;
    maxWidth?: number;
    flex?: number;
    cellStyle?: Record<string, string>;
    cellRenderer?: (params: { value: string }) => string;
  }> = [
    {
      field: 'name',
      headerName: 'Room Name',
      filter: true,
      floatingFilter: true,
      minWidth: 150,
      flex: 1,
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'location',
      headerName: 'Location',
      filter: true,
      floatingFilter: true,
      minWidth: 150,
      flex: 1
    },
    {
      field: 'capacity',
      headerName: 'Capacity',
      maxWidth: 100,
      cellStyle: { textAlign: 'center', justifyContent: 'center' }
    },
    {
      field: 'currentStatus',
      headerName: 'Status',
      minWidth: 130,
      cellRenderer: (params: any) => {
        const status = params.value;
        const colors: any = {
          'Available': 'background: #10b981; color: white;',
          'Occupied': 'background: #ef4444; color: white;',
          'Reserved': 'background: #f59e0b; color: white;'
        };
        return `<span style="padding: 6px 14px; border-radius: 16px; font-size: 12px; font-weight: 600; display: inline-block; ${colors[status]}">${status}</span>`;
      },
      cellStyle: { display: 'flex', alignItems: 'center' }
    },
    {
      field: 'currentBooking',
      headerName: 'Current Booking',
      minWidth: 250,
      flex: 2,
      cellRenderer: (params: any) => {
        const booking = params.value;
        if (!booking) return '<span style="color: #9ca3af; font-style: italic;">No active booking</span>';
        return `
          <div style="line-height: 1.6; padding: 4px 0;">
            <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${booking.employeeName}</div>
            <div style="color: #6b7280; font-size: 13px;">${booking.startTime} - ${booking.endTime}</div>
            <div style="color: #6b7280; font-size: 13px;">${booking.purpose}</div>
          </div>
        `;
      }
    },
    {
      field: 'nextBooking',
      headerName: 'Next Booking',
      minWidth: 220,
      flex: 1.5,
      cellRenderer: (params: any) => {
        const booking = params.value;
        if (!booking) return '<span style="color: #9ca3af; font-style: italic;">No upcoming booking</span>';
        return `
          <div style="line-height: 1.6; padding: 4px 0;">
            <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${booking.employeeName}</div>
            <div style="color: #6b7280; font-size: 13px;">At ${booking.startTime}</div>
            <div style="color: #6b7280; font-size: 13px;">${booking.purpose}</div>
          </div>
        `;
      }
    },
    {
      field: 'todayBookingsCount',
      headerName: 'Today\'s Bookings',
      maxWidth: 150,
      cellStyle: { textAlign: 'center', justifyContent: 'center', fontWeight: '600', color: '#3b82f6' }
    }
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<RoomSchedule>([]);
  }

  ngOnInit(): void {
    this.loadRoomsSchedule();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadRoomsSchedule(): void {
    this.loading = true;
    
    this.http.get<RoomData[]>(`${environment.apiUrl}/rooms/schedule`)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          const mappedRooms = data.map(room => this.mapRoomSchedule(room));
          this.dataSource.data = mappedRooms;
        },
        error: (error) => {
          this.snackBar.open('Failed to load room schedules', 'Close', { duration: 3000 });
        }
      });
  }

  private mapRoomSchedule(room: RoomData): RoomSchedule {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    // Find current booking
    const currentBooking = room.bookings?.find((b: BookingData) => {
      // Handle both HH:MM:SS and HH:MM formats
      const startTime = b.startTime.slice(0, 5);
      const endTime = b.endTime.slice(0, 5);
      return startTime <= currentTime && endTime >= currentTime;
    });

    // Find next booking
    const nextBooking = room.bookings
      ?.filter((b: BookingData) => {
        const startTime = b.startTime.slice(0, 5);
        return startTime > currentTime;
      })
      ?.sort((a: BookingData, b: BookingData) => a.startTime.localeCompare(b.startTime))[0];

    // Determine status
    let status: 'Available' | 'Occupied' | 'Reserved' = 'Available';
    if (currentBooking) {
      status = 'Occupied';
    } else if (nextBooking) {
      status = 'Reserved';
    }

    return {
      id: room.id.toString(),
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      currentStatus: status,
      currentBooking: currentBooking ? {
        employeeName: currentBooking.employeeName,
        startTime: this.formatTime(currentBooking.startTime),
        endTime: this.formatTime(currentBooking.endTime),
        purpose: currentBooking.purpose
      } : undefined,
      nextBooking: nextBooking ? {
        employeeName: nextBooking.employeeName,
        startTime: this.formatTime(nextBooking.startTime),
        purpose: nextBooking.purpose
      } : undefined,
      todayBookingsCount: room.bookings?.length || 0
    };
  }

  formatTime(time: string): string {
    // Handle both HH:MM:SS and HH:MM formats
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  }

  refreshData(): void {
    this.loadRoomsSchedule();
  }
}
