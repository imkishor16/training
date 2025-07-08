import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function isAuthEndpoint(url: string): boolean {
  // Exclude login, signup, and refresh token endpoints from authentication
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/v1/Users') && !url.includes('/get') && !url.includes('/update') && !url.includes('/delete')
  );
}

export function AuthInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthInterceptor: Intercepting request to:', request.url);
  console.log('AuthInterceptor: Request method:', request.method);

  // Skip interceptor for auth-related endpoints (login, signup)
  if (isAuthEndpoint(request.url)) {
    console.log('Skipping auth interceptor for auth endpoint:', request.url);
    return next(request);
  }

  // Check if token exists
  const token = authService.getToken();
  console.log('AuthInterceptor: Token exists:', !!token);

  if (!token) {
    console.log('No token available, redirecting to sign-in');
    router.navigate(['/auth/sign-in']);
    return throwError(() => new Error('No token available'));
  }

  // Check if token is expiring soon and refresh if needed
  if (authService.isTokenExpiringSoon(5)) {
    console.log('Token expiring soon, attempting to refresh');
    return authService.refreshToken().pipe(
      switchMap(() => {
        // Get the new token after refresh
        const newToken = authService.getToken();
        if (!newToken) {
          console.log('Failed to get new token after refresh');
          router.navigate(['/auth/sign-in']);
          return throwError(() => new Error('Failed to refresh token'));
        }

        console.log('Token refreshed successfully, proceeding with request');
        const authReq = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${newToken}`)
        });

        return next(authReq);
      }),
      catchError((error) => {
        console.error('Token refresh failed in interceptor:', error);
        router.navigate(['/auth/sign-in']);
        return throwError(() => error);
      })
    );
  }

  console.log('Adding Authorization header to request:', request.url);
  console.log('Token available:', !!token);

  // Clone the request and add auth header
  const authReq = request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  });

  console.log('AuthInterceptor: Request headers after adding auth:', authReq.headers.keys());

  // Handle the modified request
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error in interceptor:', error);
      if (error.status === 401) {
        // Try to refresh token on 401 error
        console.log('401 error detected, attempting token refresh');
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the original request with new token
            const newToken = authService.getToken();
            if (!newToken) {
              console.log('No new token after refresh, logging out');
              authService.logout().subscribe({
                complete: () => {
                  router.navigate(['/auth/sign-in']);
                }
              });
              return throwError(() => new Error('Token refresh failed'));
            }

            console.log('Retrying request with refreshed token');
            const retryReq = request.clone({
              headers: request.headers.set('Authorization', `Bearer ${newToken}`)
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            console.error('Token refresh failed on 401:', refreshError);
            // Logout user if refresh fails
            authService.logout().subscribe({
              complete: () => {
                router.navigate(['/auth/sign-in']);
              }
            });
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
} 