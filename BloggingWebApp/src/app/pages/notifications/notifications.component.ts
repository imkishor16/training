import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SignalRService, Notification } from '../../services/signalr.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { Post } from '../../models/post.model';
import { CreatePostDto } from '../../models/post.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PostCardComponent
  ],
  template: `
    <div class="notifications-container">
      <div class="header">
        <h1>Notifications</h1>
        <div class="header-actions">
          <button 
            *ngIf="hasUnreadNotifications"
            (click)="markAllAsRead()" 
            class="action-button secondary"
          >
            Mark All as Read
          </button>
          <button 
            *ngIf="notifications.length > 0"
            (click)="clearNotifications()" 
            class="action-button danger"
          >
            Clear All
          </button>
        </div>
      </div>

      <div class="notifications-tabs">
        <button 
          [class.active]="activeTab === 'all'"
          (click)="setActiveTab('all')"
          class="tab-button"
        >
          All ({{ notifications.length }})
        </button>
        <button 
          [class.active]="activeTab === 'unread'"
          (click)="setActiveTab('unread')"
          class="tab-button"
        >
          Unread ({{ unreadCount }})
        </button>
        <button 
          [class.active]="activeTab === 'posts'"
          (click)="setActiveTab('posts')"
          class="tab-button"
        >
          Posts ({{ postNotifications.length }})
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>

      <div *ngIf="!isLoading" class="notifications-content">
        <!-- Notifications List View -->
        <div *ngIf="activeTab !== 'posts'" class="notifications-list">
          <div 
            *ngFor="let notification of filteredNotifications" 
            class="notification-item"
            [class.unread]="!notification.isRead"
            (click)="markAsRead(notification.id)"
          >
            <div class="notification-icon">
              <svg *ngIf="notification.type === 'post'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              <svg *ngIf="notification.type === 'comment'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ getTimeAgo(notification.timestamp) }}</div>
            </div>
            <div *ngIf="!notification.isRead" class="unread-indicator"></div>
          </div>

          <div *ngIf="filteredNotifications.length === 0" class="no-notifications">
            <p>No {{ activeTab === 'unread' ? 'unread' : '' }} notifications found.</p>
          </div>
        </div>

        <!-- Posts Grid View -->
        <div *ngIf="activeTab === 'posts'" class="posts-grid">
          <ng-container *ngIf="convertedPosts.length > 0; else noPosts">
            <app-post-card 
              *ngFor="let post of convertedPosts" 
              [post]="post"
            ></app-post-card>
          </ng-container>

          <ng-template #noPosts>
            <div class="no-posts-content">
              <p>No post notifications available.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .action-button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .action-button.secondary {
      background-color: #6c757d;
      color: white;
    }

    .action-button.secondary:hover {
      background-color: #5a6268;
    }

    .action-button.danger {
      background-color: #dc3545;
      color: white;
    }

    .action-button.danger:hover {
      background-color: #c82333;
    }

    .notifications-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 10px;
    }

    .tab-button {
      padding: 8px 16px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .tab-button:hover {
      background-color: #f8f9fa;
    }

    .tab-button.active {
      background-color: #007bff;
      color: white;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 15px;
      border-radius: 8px;
      background-color: white;
      border: 1px solid #e9ecef;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item.unread {
      background-color: #f0f8ff;
      border-left: 4px solid #007bff;
    }

    .notification-icon {
      margin-right: 15px;
      margin-top: 2px;
      color: #007bff;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      margin-bottom: 5px;
      color: #212529;
    }

    .notification-message {
      color: #6c757d;
      margin-bottom: 5px;
      font-size: 14px;
    }

    .notification-time {
      color: #adb5bd;
      font-size: 12px;
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      background-color: #007bff;
      border-radius: 50%;
      margin-left: 10px;
      margin-top: 5px;
    }

    .no-notifications {
      text-align: center;
      padding: 40px;
      color: #6c757d;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .no-posts-content {
      text-align: center;
      padding: 40px;
      background: #f9f9f9;
      border-radius: 8px;
      grid-column: 1 / -1;
      color: #6c757d;
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  activeTab: 'all' | 'unread' | 'posts' = 'all';
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(private signalRService: SignalRService) {}

  ngOnInit() {
    this.loadNotifications();
    this.setupSignalRConnection();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async setupSignalRConnection() {
    await this.signalRService.startConnection();
  }

  private loadNotifications() {
    this.isLoading = true;
    
    this.signalRService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.isLoading = false;
      });

    this.signalRService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  get filteredNotifications(): Notification[] {
    switch (this.activeTab) {
      case 'unread':
        return this.notifications.filter(n => !n.isRead);
      case 'posts':
        return this.notifications.filter(n => n.type === 'post');
      default:
        return this.notifications;
    }
  }

  get postNotifications(): Notification[] {
    return this.notifications.filter(n => n.type === 'post');
  }

  get convertedPosts(): Post[] {
    return this.postNotifications
      .filter(n => n.type === 'post')
      .map(notification => {
        const postData = notification.data as CreatePostDto;
        return {
          id: notification.id,
          title: postData.title || '',
          content: postData.content || '',
          postStatus: postData.postStatus || 'Published',
          isDeleted: false,
          createdAt: notification.timestamp,
          userId: '', 
          images: []
        } as Post;
      });
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadCount > 0;
  }

  setActiveTab(tab: 'all' | 'unread' | 'posts') {
    this.activeTab = tab;
  }

  markAsRead(notificationId: string) {
    this.signalRService.markAsRead(notificationId);
  }

  markAllAsRead() {
    this.signalRService.markAllAsRead();
  }

  clearNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.signalRService.clearNotifications();
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
} 