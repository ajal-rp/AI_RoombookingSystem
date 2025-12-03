import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap, retry } from 'rxjs/operators';
import { Room } from '../models/room.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly apiUrl = `${environment.apiUrl}/rooms`;
  private roomsCache$?: Observable<Room[]>;
  private scheduleCache$?: Observable<any[]>;
  private readonly CACHE_SIZE = 1;
  private readonly CACHE_DURATION = 300000; // 5 minutes
  private lastScheduleFetch = 0;

  constructor(private readonly http: HttpClient) {}

  getRooms(): Observable<Room[]> {
    return this.getAllRooms();
  }

  getAllRooms(search?: string, minCapacity?: number, location?: string): Observable<Room[]> {
    // If no filters and cache exists, return cached data
    if (!search && !minCapacity && !location && this.roomsCache$) {
      return this.roomsCache$;
    }

    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (minCapacity) params = params.set('minCapacity', minCapacity.toString());
    if (location) params = params.set('location', location);

    const request$ = this.http.get<Room[]>(this.apiUrl, { params }).pipe(
      retry(2), // Retry failed requests twice
      catchError(this.handleError),
      shareReplay({ bufferSize: this.CACHE_SIZE, refCount: true })
    );

    // Cache only if no filters
    if (!search && !minCapacity && !location) {
      this.roomsCache$ = request$;
    }

    return request$;
  }

  getRoomSchedules(): Observable<any[]> {
    const now = Date.now();
    // Return cached data if still fresh (within 5 minutes)
    if (this.scheduleCache$ && (now - this.lastScheduleFetch) < this.CACHE_DURATION) {
      return this.scheduleCache$;
    }

    this.lastScheduleFetch = now;
    this.scheduleCache$ = this.http.get<any[]>(`${this.apiUrl}/schedule`).pipe(
      retry(2),
      catchError(this.handleError),
      shareReplay({ bufferSize: this.CACHE_SIZE, refCount: true })
    );

    return this.scheduleCache$;
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  createRoom(room: Omit<Room, 'id'>): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  clearCache(): void {
    this.roomsCache$ = undefined;
    this.scheduleCache$ = undefined;
    this.lastScheduleFetch = 0;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Server error: ${error.status}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

