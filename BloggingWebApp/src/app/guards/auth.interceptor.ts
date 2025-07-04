import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip interceptor for auth-related endpoints (login, signup)
    if (this.isAuthEndpoint(request.url)) {
      console.log('Skipping auth interceptor for auth endpoint:', request.url);
      return next.handle(request);
    }

    // Check if token exists
    const token = this.authService.getToken();
    if (!token) {
      console.log('No token available, redirecting to sign-in');
      this.router.navigate(['/auth/sign-in']);
      return throwError(() => new Error('No token available'));
    }

    // Clone the request and add auth header
    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });

    // Handle the modified request
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error in interceptor:', error);
        if (error.status === 401) {
          // Token expired or invalid - logout for auth failures
          // But don't trigger logout for user update operations
          if (!request.url.includes('/v1/Users/')) {
            console.log('401 error detected, logging out user');
            this.authService.logout().subscribe({
              complete: () => {
                this.router.navigate(['/auth/sign-in']);
              }
            });
          }
        }
        return throwError(() => error);
      })
    );
  }

  private isAuthEndpoint(url: string): boolean {
    return (
      url.includes('/auth/login') || 
      url.includes('/auth/signup') ||
      (url.includes('/v1/Users') && !url.includes('/v1/Users/get'))
    );
  }
} 