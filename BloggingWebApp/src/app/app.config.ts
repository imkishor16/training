import { ApplicationConfig, inject, importProvidersFrom } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Create the interceptor function
const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Skip interceptor for auth-related endpoints
  if (req.url.includes('/login') || req.url.includes('/signup')) {
    return next(req);
  }

  // Check if token exists
  const token = authService.getToken();
  if (!token) {
    router.navigate(['/auth/sign-in']);
    return throwError(() => new Error('No token available'));
  }

  // Clone the request and add auth header
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });

  // Handle the modified request
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid
        authService.logout().subscribe({
          complete: () => {
            router.navigate(['/auth/sign-in']);
          }
        });
      }
      return throwError(() => error);
    })
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserModule),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations()
  ]
};
