import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Post, PostStatus } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="post-card">
      <div *ngIf="post.images && post.images.length > 0" class="post-card-image-wrapper">
        <img [src]="post.images[0].content" [alt]="post.images[0].name" class="post-card-image" />
      </div>
      <mat-card-header [class.pt-0]="post.images && post.images.length > 0">
        <div mat-card-avatar class="bg-indigo-100 flex items-center justify-center rounded-full">
          <mat-icon color="primary">person</mat-icon>
        </div>
        <mat-card-title class="cursor-pointer truncate" (click)="viewPost.emit(post.id)">
          {{ post.title }}
        </mat-card-title>
        <mat-card-subtitle class="flex items-center justify-between">
          <span class="truncate max-w-[100px]">{{ post.user?.name || post.user?.username || 'Anonymous' }}</span>
          <div class="flex items-center">
            <span [ngClass]="{
              'text-green-600': post.postStatus === 'Published',
              'text-yellow-600': post.postStatus === 'Draft',
              'text-red-600': post.postStatus === 'Deleted',
              'text-blue-600': post.postStatus === 'Approved'
            }" class="text-xs font-medium ml-2">
              {{ post.postStatus }}
            </span>
            <button 
              *ngIf="isAdmin"
              mat-icon-button 
              [matMenuTriggerFor]="menu"
              (click)="$event.stopPropagation()"
            >
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="statusChanged.emit({ post, status: 'Published' })">
                <mat-icon color="primary">publish</mat-icon>
                <span>Publish</span>
              </button>
              <button mat-menu-item (click)="statusChanged.emit({ post, status: 'Draft' })">
                <mat-icon>drafts</mat-icon>
                <span>Move to Draft</span>
              </button>
              <button mat-menu-item (click)="deletePost.emit(post)">
                <mat-icon color="warn">delete</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>
          </div>
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content (click)="viewPost.emit(post.id)" class="cursor-pointer post-card-content">
        <p class="line-clamp-3 text-gray-700 mb-2">{{ post.content }}</p>
      </mat-card-content>

      <mat-card-actions class="flex justify-between items-center px-4 pb-2 pt-0">
        <div class="flex items-center space-x-4">
          <button 
            *ngIf="isLoggedIn"
            mat-icon-button 
            [color]="post.isLikedByCurrentUser ? 'warn' : ''"
            (click)="likeToggled.emit(post)"
            [matTooltip]="post.isLikedByCurrentUser ? 'Unlike' : 'Like'"
          >
            <mat-icon>{{ post.isLikedByCurrentUser ? 'favorite' : 'favorite_border' }}</mat-icon>
            <span class="ml-1 text-sm">{{ post.likesCount || 0 }}</span>
          </button>
          <button
            mat-icon-button
            [matTooltip]="post.comments?.length + ' comments'"
            (click)="viewPost.emit(post.id)"
          >
            <mat-icon>comment</mat-icon>
            <span class="ml-1 text-sm">{{ post.comments?.length || 0 }}</span>
          </button>
        </div>
        <div class="flex items-center text-xs text-gray-500">
          <mat-icon class="text-base mr-1">schedule</mat-icon>
          {{ post.createdAt | date:'MMM d, y' }}
          <span *ngIf="post.updatedAt" class="ml-2 italic">
            (edited)
          </span>
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .post-card {
      width: 100%;
      max-width: 370px;
      min-width: 270px;
      height: 370px;
      min-height: 370px;
      max-height: 370px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin: auto;
      box-sizing: border-box;
      overflow: hidden;
    }
    .post-card-image-wrapper {
      width: 100%;
      height: 140px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }
    .post-card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
      display: block;
    }
    .post-card-content {
      flex: 1 1 auto;
      min-height: 60px;
      max-height: 80px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      word-break: break-word;
      max-height: 4.5em;
    }
    mat-card-title.truncate, .truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }
    img {
      object-fit: cover;
      border-radius: 0.5rem;
    }
  `]
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() isLoggedIn = false;
  @Input() isAdmin = false;
  @Output() likeToggled = new EventEmitter<Post>();
  @Output() statusChanged = new EventEmitter<{ post: Post; status: PostStatus }>();
  @Output() deletePost = new EventEmitter<Post>();
  @Output() viewPost = new EventEmitter<string>();
} 