import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppMessage, MessageType, AppError, createAppError, SUCCESS_MESSAGES } from '../models/error.model';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Comment, UpdateCommentDto } from '../models/post.model';
import { API_ENDPOINTS } from './api';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageSubject = new BehaviorSubject<AppMessage | null>(null);
  public message$ = this.messageSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  showMessage(message: AppMessage): void {
    this.messageSubject.next(message);
    
    // Auto-dismiss if duration is set
    if (message.duration !== 0) {
      const duration = message.duration || 5000; // Default 5 seconds
      setTimeout(() => {
        this.clearMessage();
      }, duration);
    }
  }

  showSuccess(title: string, message: string, duration?: number): void {
    this.showMessage({
      type: MessageType.SUCCESS,
      title,
      message,
      duration
    });
  }

  showError(title: string, message: string, duration?: number): void {
    this.showMessage({
      type: MessageType.ERROR,
      title,
      message,
      duration
    });
  }

  showWarning(title: string, message: string, duration?: number): void {
    this.showMessage({
      type: MessageType.WARNING,
      title,
      message,
      duration
    });
  }

  showInfo(title: string, message: string, duration?: number): void {
    this.showMessage({
      type: MessageType.INFO,
      title,
      message,
      duration
    });
  }

  showAppError(error: AppError, duration?: number): void {
    this.showError(error.type, error.message, duration);
  }

  showHttpError(error: any, duration?: number): void {
    const appError = createAppError(error);
    this.showAppError(appError, duration);
  }

  showSuccessMessage(key: keyof typeof SUCCESS_MESSAGES, duration?: number): void {
    const successMessage = SUCCESS_MESSAGES[key];
    this.showSuccess(successMessage.title, successMessage.message, duration);
  }

  clearMessage(): void {
    this.messageSubject.next(null);
  }

  getCurrentMessage(): AppMessage | null {
    return this.messageSubject.value;
  }

  updateComment(commentId: string, updateData: UpdateCommentDto): Observable<Comment> {
    return this.http.put<Comment>(`${API_ENDPOINTS.UPDATE_COMMENT}/${commentId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    }).pipe(catchError(this.handleError));
  }

  deleteComment(commentId: string): Observable<Comment> {
    const updateData: UpdateCommentDto = {
      status: 'Deleted'
    };
    return this.updateComment(commentId, updateData);
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Error: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => errorMessage);
  }

  // showSuccess(title: string, message: string) {
  //   this.notificationService.show({
  //     type: 'success',
  //     title,
  //     message
  //   });
  // }

  // showHttpError(error: any) {
  //   this.showError('Error', this.handleError(error));
  // }
} 