import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService, Notification } from '../../services/notification.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  loading = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications(false).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
        },
        error: () => {
          this.snackBar.open('Failed to mark notification as read', 'Close', { duration: 3000 });
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        for (const n of this.notifications) {
          n.isRead = true;
        }
      },
      error: () => {
        this.snackBar.open('Failed to mark all as read', 'Close', { duration: 3000 });
      }
    });
  }

  deleteNotification(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notificationService.refreshUnreadCount();
      }
    });
  }

  onNotificationClick(notification: Notification): void {
    this.markAsRead(notification, new Event('click'));
    
    // Navigate to relevant page based on notification type
    if (notification.bookingRequestId) {
      this.router.navigate(['/dashboard/requests']);
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'BookingConfirmed':
        return 'check_circle';
      case 'BookingRejected':
        return 'cancel';
      case 'BookingConflict':
        return 'warning';
      case 'NewBookingRequest':
        return 'notification_important';
      case 'BookingReminder':
        return 'schedule';
      default:
        return 'notifications';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'BookingConfirmed':
        return 'success';
      case 'BookingRejected':
        return 'warn';
      case 'BookingConflict':
        return 'warn';
      case 'NewBookingRequest':
        return 'primary';
      default:
        return 'default';
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }
}
