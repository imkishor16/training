import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, NotificationResponseDto } from '../../services/notification.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { NotificationsCardComponent } from '../../components/notifications-card/notifications-card.component';
import { Post } from '../../models/post.model';
import { CreatePostDto } from '../../models/post.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PostCardComponent,
    NotificationsCardComponent
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
        <!-- <button 
          [class.active]="activeTab === 'posts'"
          (click)="setActiveTab('posts')"
          class="tab-button"
        >
          Posts ({{ postNotifications.length }})
        </button> -->
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>

      <div *ngIf="!isLoading" class="notifications-content">
        <!-- No Notifications Message -->
        <div *ngIf="notifications.length === 0" class="no-notifications">
          <div class="no-notifications-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <h3>No notifications yet</h3>
          <p>You're all caught up! When you receive notifications, they'll appear here.</p>
        </div>

        <!-- All Tab - Notifications List View -->
        <div *ngIf="notifications.length > 0 && activeTab === 'all'" class="notifications-list">
          <app-notifications-card 
            *ngFor="let notification of filteredNotifications" 
            [notification]="notification"
            (markAsRead)="markAsRead($event)"
            (deleteNotification)="handleDeleteNotification($event)"
          ></app-notifications-card>
        </div>

        <!-- Unread Tab - Notifications List View -->
        <div *ngIf="notifications.length > 0 && activeTab === 'unread'" class="notifications-list">
          <div 
            *ngFor="let notification of filteredNotifications" 
            class="notification-item"
            [class.unread]="!notification.isRead"
            (click)="markAsRead(notification.id)"
          >
            <div class="notification-icon">
              <svg *ngIf="notification.entityName === 'Post'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              <svg *ngIf="notification.entityName === 'User'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="notification-content">
              <div class="notification-message">{{ notification.content }}</div>
              <div class="notification-time">{{ getTimeAgo(notification.createdAt) }}</div>
            </div>
            <div *ngIf="!notification.isRead" class="unread-indicator"></div>
            <button 
              class="delete-button"
              (click)="deleteNotification(notification.id, $event)"
              title="Delete notification"
            >
              ✕
            </button>
          </div>

          <div *ngIf="filteredNotifications.length === 0" class="no-notifications">
            <p>No unread notifications found.</p>
          </div>
        </div>

        <!-- Posts Grid View -->
        <div *ngIf="notifications.length > 0 && activeTab === 'posts'" class="posts-grid">
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
      font-size: 0.8rem;
      color: #6c757d;
      margin-top: 5px;
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      background-color: #007bff;
      border-radius: 50%;
      margin-left: 10px;
      margin-top: 5px;
    }

    .delete-button {
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
      margin-left: auto;
      font-size: 14px;
      transition: all 0.2s;
    }

    .delete-button:hover {
      background-color: #f8f9fa;
      color: #dc3545;
    }

    .no-notifications {
      text-align: center;
      padding: 60px 40px;
      color: #6c757d;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }

    .no-notifications-icon {
      margin-bottom: 20px;
      color: #dee2e6;
    }

    .no-notifications h3 {
      margin: 0 0 10px 0;
      color: #495057;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .no-notifications p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.5;
      max-width: 400px;
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
  notifications: NotificationResponseDto[] = [];
  unreadCount = 0;
  activeTab: 'all' | 'unread' | 'posts' = 'all';
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor( private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNotifications() {
    this.isLoading = true;
    
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: NotificationResponseDto[]) => {
          console.log('Notifications loaded:', response);
          console.log('Response type:', typeof response);
          console.log('Response is array:', Array.isArray(response));
          console.log('Response length:', response?.length);
          this.notifications = response || [];
          console.log('Component notifications after assignment:', this.notifications);
          console.log('Component notifications length:', this.notifications.length);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.notifications = [];
          this.isLoading = false;
        }
      });
  }

  private loadUnreadCount() {
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.unreadCount = response.unreadCount;
        },
        error: (error) => {
          console.error('Error loading unread count:', error);
        }
      });
  }

  get filteredNotifications(): NotificationResponseDto[] {
    if (!this.notifications) {
      return [];
    }
    switch (this.activeTab) {
      case 'unread':
        return this.notifications.filter(n => !n.isRead);
      case 'all':
        return this.notifications;
      case 'posts':
        return this.notifications.filter(n => n.entityName === 'Post');
      default:
        return this.notifications;
    }
  }

  get postNotifications(): NotificationResponseDto[] {
    if (!this.notifications) {
      return [];
    }
    return this.notifications.filter(n => n.entityName === 'Post');
  }

  get convertedPosts(): Post[] {
    // This is a placeholder - you'll need to fetch actual post data based on entityId
    return [];
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadCount > 0;
  }

  setActiveTab(tab: 'all' | 'unread' | 'posts') {
    console.log('Switching to tab:', tab);
    this.activeTab = tab;
    console.log('Filtered notifications count:', this.filteredNotifications.length);
  }

  markAsRead(notificationId: number) {
    this.notificationService.markNotificationAsRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedNotification) => {
          // Update the notification in the local array
          const index = this.notifications.findIndex(n => n.id === notificationId);
          if (index !== -1) {
            this.notifications[index] = updatedNotification;
          }
          // Reload unread count
          this.loadUnreadCount();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
  }

  markAllAsRead() {
    this.notificationService.markAllNotificationsAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Mark all notifications as read in the local array
          this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
          this.unreadCount = 0;
        },
        error: (error) => {
          console.error('Error marking all notifications as read:', error);
        }
      });
  }

  clearNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
      // This would need to be implemented in the backend
      console.log('Clear notifications functionality not implemented');
    }
  }

  handleDeleteNotification(notificationId: number) {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notificationService.deleteNotification(notificationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Remove the notification from the local array
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            // Reload unread count
            this.loadUnreadCount();
          },
          error: (error) => {
            console.error('Error deleting notification:', error);
          }
        });
    }
  }

  deleteNotification(notificationId: number, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notificationService.deleteNotification(notificationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Remove the notification from the local array
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            // Reload unread count
            this.loadUnreadCount();
          },
          error: (error) => {
            console.error('Error deleting notification:', error);
          }
        });
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
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