import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid - use authService to maintain consistent state
          this.authService.logout();
          
          // Show notification
          this.snackBar.open('Your session has expired. Please login again.', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

          // Redirect to login with return URL
          const returnUrl = this.router.url;
          const targetUrl = returnUrl === '/login' ? '/' : returnUrl;
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: targetUrl }
          });
        }

        return throwError(() => error);
      })
    );
  }
}
