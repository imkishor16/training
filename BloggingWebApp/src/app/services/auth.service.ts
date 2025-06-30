import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SignUpRequest, SignInRequest, AuthResponse, User, UserRole } from '../models/auth.model';
import { API_ENDPOINTS } from './api';
import { createAppError } from '../models/error.model';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../models/jwt.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<boolean>(this.isAuthenticated());
  isAuthenticated$ = this.authState.asObservable();

  constructor(private readonly http: HttpClient) {}

  signUp(request: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.SIGNUP, request)
      .pipe(catchError(this.handleError));
  }

  signIn(request: SignInRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.LOGIN, request)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.LOGOUT, {refreshToken: this.getToken()}, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.authState.next(false);
      }),
      catchError(this.handleError)
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.authState.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getUserIdFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.nameid || decoded.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  getCurrentUserId(): string | null {
    return this.getUserIdFromToken();
  }

  getCurrentUserRole(): UserRole | null {
    return this.getCurrentUser()?.role || null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  debugTokenStorage(): void {
    console.log('=== Token Storage Debug ===');
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('isAuthenticated():', this.isAuthenticated());
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('==========================');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const appError = createAppError(error);
    return throwError(() => appError);
  }
}
