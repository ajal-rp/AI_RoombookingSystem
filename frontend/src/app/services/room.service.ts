import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, shareReplay, tap, retry } from 'rxjs/operators';
import { Room } from '../models/room.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly apiUrl = `${environment.apiUrl}/rooms`;
  private roomsCache$?: Observable<Room[]>;
  private readonly CACHE_SIZE = 1;

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
    return this.http.get<any[]>(`${this.apiUrl}/schedule`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  clearCache(): void {
    this.roomsCache$ = undefined;
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
    
    console.error('RoomService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

