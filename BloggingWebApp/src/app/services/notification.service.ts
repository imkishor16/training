import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ENDPOINTS } from './api';
import { createAppError } from '../models/error.model';
import { AuthService } from './auth.service';

export interface NotificationResponseDto {
  id: number;
  entityName: string;
  entityId: string; // UUID string
  content: string;
  createdAt: string; // ISO date string
  isRead: boolean;
  readAt?: string; // ISO date string, optional
}

export interface CreateNotificationDto {
  entityName: string;
  entityId: string; // UUID string
  content: string;
  userIds: string[]; // Array of user IDs
}



export interface UnreadCountResponse {
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  /**
   * Get paginated notifications
   */
  getNotifications(page: number = 1, pageSize: number = 10): Observable<NotificationResponseDto[]> {
    return this.http
      .get<NotificationResponseDto[]>(API_ENDPOINTS.GET_NOTIFICATIONS(page, pageSize), {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get a specific notification by ID
   */
  getNotificationById(id: number): Observable<NotificationResponseDto> {
    return this.http
      .get<NotificationResponseDto>(API_ENDPOINTS.GET_NOTIFICATION_BY_ID(id), {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Mark a notification as read
   */
  markNotificationAsRead(id: number): Observable<NotificationResponseDto> {
    return this.http
      .put<NotificationResponseDto>(API_ENDPOINTS.MARK_NOTIFICATION_READ(id), {}, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): Observable<void> {
    return this.http
      .put<void>(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, {}, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a notification
   */
  deleteNotification(id: number): Observable<void> {
    return this.http
      .delete<void>(API_ENDPOINTS.DELETE_NOTIFICATION(id), {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http
      .get<UnreadCountResponse>(API_ENDPOINTS.GET_UNREAD_COUNT, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new notification
   */
  createNotification(notification: CreateNotificationDto): Observable<NotificationResponseDto> {
    return this.http
      .post<NotificationResponseDto>(API_ENDPOINTS.CREATE_NOTIFICATION, notification, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`,
          'Content-Type': 'application/json'
        }
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a notification for a new post
   */
  createPostNotification(postId: string, postTitle: string, userIds: string[]): Observable<NotificationResponseDto> {
    const notification: CreateNotificationDto = {
      entityName: 'Post',
      entityId: postId,
      content: `New post published: ${postTitle}`,
      userIds: userIds
    };
    return this.createNotification(notification);
  }

  /**
   * Create a notification for a new comment
   */
  createCommentNotification(postId: string, postTitle: string, commentAuthor: string, userIds: string[]): Observable<NotificationResponseDto> {
    const notification: CreateNotificationDto = {
      entityName: 'Post',
      entityId: postId,
      content: `${commentAuthor} commented on: ${postTitle}`,
      userIds: userIds
    };
    return this.createNotification(notification);
  }

  /**
   * Create a notification for a new like
   */
  createLikeNotification(postId: string, postTitle: string, likedBy: string, userIds: string[]): Observable<NotificationResponseDto> {
    const notification: CreateNotificationDto = {
      entityName: 'Post',
      entityId: postId,
      content: `${likedBy} liked: ${postTitle}`,
      userIds: userIds
    };
    return this.createNotification(notification);
  }

  /**
   * Create a notification for user suspension
   */
  createSuspensionNotification(userId: string, reason: string, suspendedUntil?: string): Observable<NotificationResponseDto> {
    const content = suspendedUntil 
      ? `Your account has been suspended until ${new Date(suspendedUntil).toLocaleDateString()}. Reason: ${reason}`
      : `Your account has been suspended. Reason: ${reason}`;

    const notification: CreateNotificationDto = {
      entityName: 'User',
      entityId: userId,
      content: content,
      userIds: [userId]
    };
    return this.createNotification(notification);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const appError = createAppError(error);
    return throwError(() => appError);
  }
} 