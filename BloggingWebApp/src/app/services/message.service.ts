import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppMessage, MessageType, AppError, createAppError, SUCCESS_MESSAGES } from '../models/error.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageSubject = new BehaviorSubject<AppMessage | null>(null);
  public message$ = this.messageSubject.asObservable();

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
} 