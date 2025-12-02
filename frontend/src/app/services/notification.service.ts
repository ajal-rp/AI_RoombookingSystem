import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: 'BookingConflict' | 'BookingConfirmed' | 'BookingRejected' | 'NewBookingRequest' | 'BookingReminder' | 'System';
  isRead: boolean;
  createdAt: string;
  bookingRequestId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Poll for new notifications every 30 seconds
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.getUnreadCount())
      )
      .subscribe();
  }

  getNotifications(unreadOnly: boolean = false): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.apiUrl}/notifications`, {
      params: { unreadOnly: unreadOnly.toString() }
    });
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/notifications/unread-count`)
      .pipe(
        tap(response => this.unreadCountSubject.next(response.count))
      );
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/notifications/${id}/mark-read`, {})
      .pipe(
        tap(() => {
          const currentCount = this.unreadCountSubject.value;
          this.unreadCountSubject.next(Math.max(0, currentCount - 1));
        })
      );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${environment.apiUrl}/notifications/mark-all-read`, {})
      .pipe(
        tap(() => this.unreadCountSubject.next(0))
      );
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/notifications/${id}`);
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }
}
