import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SignUpRequest, SignInRequest, AuthResponse } from '../models/auth.model';
import { API_ENDPOINTS } from './api';
import { createAppError } from '../models/error.model';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../models/jwt.model';
import { BehaviorSubject } from 'rxjs';
import { User, UserRole } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  signUp(request: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.SIGNUP, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  signIn(request: SignInRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.LOGIN, request)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.LOGOUT, {}, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        console.log('Token and user removed from localStorage');
      }),
      catchError(this.handleError)
    );
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    // console.log('Getting token from localStorage:', token ? 'Token found' : 'No token');
    return token;
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    console.log('Token stored in localStorage:', token ? 'Token saved' : 'No token to save');
  }

  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token'); 
    // console.log('Getting userId from token:', token ? 'Token found' : 'No token');
    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }
  
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      // console.log('Decoded token:', decoded);
  
      // Prefer custom claim `userId`, fallback to `sub`
      return decoded.nameid || decoded.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getCurrentUserId(): string | null {
    return this.getUserIdFromToken();
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

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserRole(): UserRole | null {
    return this.getCurrentUser()?.role || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const appError = createAppError(error);
    return throwError(() => appError);
  }
} 