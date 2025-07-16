import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationResponseDto } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="notification-card"
      [class.unread]="!notification.isRead"
      (click)="onCardClick()"
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
        (click)="onDeleteClick($event)"
        title="Delete notification"
      >
        ✕
      </button>
    </div>
  `,
  styles: [`
    .notification-card {
      display: flex;
      align-items: flex-start;
      padding: 15px;
      border-radius: 8px;
      background-color: white;
      border: 1px solid #e9ecef;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      margin-bottom: 10px;
    }

    .notification-card:hover {
      background-color: #f8f9fa;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .notification-card.unread {
      background-color: #f0f8ff;
      border-left: 4px solid #007bff;
    }

    .notification-icon {
      margin-right: 15px;
      margin-top: 2px;
      color: #007bff;
      flex-shrink: 0;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-message {
      color: #212529;
      margin-bottom: 5px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
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
      flex-shrink: 0;
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
      flex-shrink: 0;
    }

    .delete-button:hover {
      background-color: #f8f9fa;
      color: #dc3545;
    }
  `]
})
export class NotificationsCardComponent {
  @Input() notification!: NotificationResponseDto;
  @Output() markAsRead = new EventEmitter<number>();
  @Output() deleteNotification = new EventEmitter<number>();

  constructor(private router: Router) {}

  onCardClick() {
    // Mark as read first
    this.markAsRead.emit(this.notification.id);
    
    // Navigate to the post if it's a post notification
    if (this.notification.entityName === 'Post') {
      this.router.navigate(['/posts', this.notification.entityId]);
    }
  }

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.deleteNotification.emit(this.notification.id);
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