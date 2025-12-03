import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry, tap } from "rxjs/operators";
import {
  BookingRequest,
  CreateBookingRequest,
  UpdateBookingRequest,
  RejectBookingRequest,
} from "../models/booking.model";
import { environment } from "../../environments/environment";

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Injectable({
  providedIn: "root",
})
export class BookingService {
  private readonly apiUrl = `${environment.apiUrl}/bookingrequests`;
  private pendingRequestsCache$?: Observable<BookingRequest[]>;
  private lastPendingFetch = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute

  constructor(private readonly http: HttpClient) {}

  createBookingRequest(
    request: CreateBookingRequest
  ): Observable<BookingRequest> {
    return this.http.post<BookingRequest>(this.apiUrl, request).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getPendingRequests(): Observable<BookingRequest[]> {
    const now = Date.now();
    // Return cached data if still fresh (within 1 minute)
    if (this.pendingRequestsCache$ && (now - this.lastPendingFetch) < this.CACHE_DURATION) {
      return this.pendingRequestsCache$;
    }

    this.lastPendingFetch = now;
    this.pendingRequestsCache$ = this.http.get<BookingRequest[]>(`${this.apiUrl}/pending`).pipe(
      retry(2),
      catchError(this.handleError),
      tap(() => this.lastPendingFetch = Date.now())
    );

    return this.pendingRequestsCache$;
  }

  getBookingRequests(
    status?: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    pageSize: number = 50
  ): Observable<PaginatedResponse<BookingRequest>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      
    if (status) params = params.set('status', status);
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getMyRequests(): Observable<BookingRequest[]> {
    return this.http.get<BookingRequest[]>(`${this.apiUrl}/my-requests`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getBookingById(id: number): Observable<BookingRequest> {
    return this.http.get<BookingRequest>(`${this.apiUrl}/${id}`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  updateBookingRequest(id: number, request: UpdateBookingRequest): Observable<BookingRequest> {
    return this.http.put<BookingRequest>(`${this.apiUrl}/${id}`, request).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  deleteBookingRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  confirmRequest(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/confirm`, {}).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  rejectRequest(id: number, request: RejectBookingRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reject`, request).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  checkAvailability(
    roomId: number,
    date: string,
    startTime: string,
    endTime: string
  ): Observable<{ available: boolean }> {
    const params = new HttpParams()
      .set("roomId", roomId.toString())
      .set("date", date)
      .set("startTime", startTime)
      .set("endTime", endTime);

    return this.http.get<{ available: boolean }>(
      `${this.apiUrl}/check-availability`,
      { params }
    ).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Server error: ${error.status} - ${error.statusText}`;
    }
    
    console.error('BookingService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
