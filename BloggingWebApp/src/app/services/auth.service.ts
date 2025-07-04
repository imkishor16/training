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
    console.log('Attempting to sign up user:', { ...request, password: '***' });
    return this.http.post<AuthResponse>(API_ENDPOINTS.SIGNUP, request)
      .pipe(
        tap(response => {
          console.log('Sign up successful:', { ...response, token: '***' });
          // Don't store auth tokens on signup, user needs to sign in
        }),
        catchError(error => {
          console.error('Sign up failed:', error);
          return this.handleError(error);
        })
      );
  }

  signIn(request: SignInRequest): Observable<AuthResponse> {
    console.log('Attempting to sign in user:', { ...request, password: '***' });
    return this.http.post<AuthResponse>(API_ENDPOINTS.LOGIN, request)
      .pipe(
        tap(response => {
          console.log('Sign in successful:', { ...response, token: '***' });
          this.handleAuthResponse(response);
        }),
        catchError(error => {
          console.error('Sign in failed:', error);
          return this.handleError(error);
        })
      );
  }

  logout(): Observable<void> {
    console.log('Attempting to log out user');
    return this.http.post<void>(API_ENDPOINTS.LOGOUT, {refreshToken: this.getToken()}).pipe(
      tap(() => {
        console.log('Logout successful');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.authState.next(false);
      }),
      catchError(error => {
        console.error('Logout failed:', error);
        // Clean up local storage even if the API call fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.authState.next(false);
        return this.handleError(error);
      })
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('email', response.email);
    this.authState.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.authState.next(true);
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

  getCurrentUser(): Observable<User | null> {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return new Observable(subscriber => subscriber.next(null));
    return this.http.get<User>(API_ENDPOINTS.GET_USER_BY_ID(currentUserId)).pipe(
      catchError(error => {
        console.error('Error getting user:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      console.log('Decoded token:', decodedToken.nameid);
      return decodedToken.nameid || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getCurrentUserRole(): UserRole | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      return decodedToken.role as UserRole || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp ? decodedToken.exp > currentTime : false;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
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
    console.error('API Error:', error);
    const appError = createAppError(error);
    return throwError(() => appError);
  }
}
