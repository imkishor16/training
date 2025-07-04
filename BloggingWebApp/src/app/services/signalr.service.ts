import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { getSignalRHubUrl } from './api';
import { AuthService } from './auth.service';
import { CreatePostDto } from '../models/post.model';
import { CreateCommentDto } from '../models/comment.model';

export interface Notification {
  id: string;
  type: 'post' | 'comment';
  title: string;
  message: string;
  timestamp: Date;
  data: CreatePostDto | CreateCommentDto;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private notifications = new BehaviorSubject<Notification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  public notifications$ = this.notifications.asObservable();
  public unreadCount$ = this.unreadCount.asObservable();

  constructor(private authService: AuthService) {
    this.loadNotificationsFromStorage();
  }

  async startConnection(): Promise<void> {
    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(getSignalRHubUrl(), {
          accessTokenFactory: () => this.authService.getToken() || ''
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      this.setupSignalRHandlers();

      await this.hubConnection.start();
      console.log('SignalR Connected!');
    } catch (error) {
      console.error('Error while establishing SignalR connection: ', error);
    }
  }

  private setupSignalRHandlers(): void {
    if (!this.hubConnection) return;

    // Handle new post notifications
    this.hubConnection.on('ReceiveNewPost', (post: CreatePostDto) => {
      console.log('Received new post notification:', post);
      this.addNotification({
        id: this.generateId(),
        type: 'post',
        title: 'New Post Published',
        message: `${post.title} was just posted`,
        timestamp: new Date(),
        data: post,
        isRead: false
      });
    });

    // Handle new comment notifications
    this.hubConnection.on('ReceiveNewComment', (comment: CreateCommentDto) => {
      console.log('Received new comment notification:', comment);
      this.addNotification({
        id: this.generateId(),
        type: 'comment',
        title: 'New Comment',
        message: `New comment on post by ${comment.userId}`,
        timestamp: new Date(),
        data: comment,
        isRead: false
      });
    });

    // Handle connection events
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected!');
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed');
    });
  }

  private addNotification(notification: Notification): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = [notification, ...currentNotifications];
    
    // Keep only last 50 notifications
    if (updatedNotifications.length > 50) {
      updatedNotifications.splice(50);
    }
    
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notifications.value.filter(n => !n.isRead).length;
    this.unreadCount.next(unreadCount);
  }

  markAsRead(notificationId: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification
    );
    
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  markAllAsRead(): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      isRead: true
    }));
    
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  clearNotifications(): void {
    this.notifications.next([]);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  getNotifications(): Notification[] {
    return this.notifications.value;
  }

  getUnreadCount(): number {
    return this.unreadCount.value;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveNotificationsToStorage(): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications.value));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }

  private loadNotificationsFromStorage(): void {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notifications.next(notifications);
        this.updateUnreadCount();
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }
} 