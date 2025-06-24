import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SignUpRequest, SignInRequest, AuthResponse } from '../models/auth.model';
import { API_ENDPOINTS } from './api';
import { createAppError } from '../models/error.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  signUp(request: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.SIGNUP, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  signIn(request: SignInRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.LOGIN, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('Getting token from localStorage:', token ? 'Token found' : 'No token');
    return token;
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    console.log('Token stored in localStorage:', token ? 'Token saved' : 'No token to save');
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    console.log('isAuthenticated check:', hasToken);
    return hasToken;
  }

  // Debug method to check localStorage status
  debugTokenStorage(): void {
    console.log('=== Token Storage Debug ===');
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('getToken():', this.getToken());
    console.log('isAuthenticated():', this.isAuthenticated());
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('==========================');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const appError = createAppError(error);
    return throwError(() => appError);
  }
} 