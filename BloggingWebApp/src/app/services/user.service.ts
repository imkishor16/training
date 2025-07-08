import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/auth.model';
import { API_ENDPOINTS } from './api';
import { createAppError } from '../models/error.model';
import { AuthService } from './auth.service';

export interface UpdateUserRequest {
  username?: string;
  status?: string;
  password?: string;
  role?: string;
  isSuspended?: boolean;
  suspensionReason?: string;
  suspendedUntil?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}



  getUserById(userId: string): Observable<User> {
    return this.http
      .get<User>(API_ENDPOINTS.GET_USER_BY_ID(userId))
      .pipe(catchError(this.handleError));
  }

  updateUser(userId: string, updateData: UpdateUserRequest): Observable<User> {
    console.log('Updating user:', userId, 'with data:', updateData);

    return this.http
      .put<User>(API_ENDPOINTS.UPDATE_USER(userId), updateData, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  deleteUser(userId: string): Observable<void> {
    return this.http
      .delete<void>(API_ENDPOINTS.DELETE_USER(userId), {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  getAllUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(API_ENDPOINTS.GET_ALL_USERS, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http
      .post<User>(API_ENDPOINTS.CREATE_USER, userData, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  getPostsByUser(userId: string): Observable<any[]> {
    return this.http
      .get<any[]>(API_ENDPOINTS.GET_POST_BY_USER(userId), {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  getAllUsersFiltered(): Observable<User[]> {
    return this.http
      .get<User[]>(API_ENDPOINTS.GET_ALL_USERS_FILTERED, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const appError = createAppError(error);
    return throwError(() => appError);
  }
} 