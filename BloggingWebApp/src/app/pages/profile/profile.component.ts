import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/auth.model';
import { Post } from '../../models/post.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    PostCardComponent
  ],
  template: `
    <div class="profile-container">
      <!-- User Info Card -->
      <div class="profile-header-card">
        <ng-container *ngIf="!isLoadingUser; else loadingUser">
          <div class="profile-header-content">
            <p-avatar 
              [label]="user?.username?.charAt(0) || 'U'"
              shape="circle"
              size="xlarge"
              [style]="{ backgroundColor: '#2196F3', color: '#ffffff', width: '100px', height: '100px', fontSize: '2.5rem' }"
            ></p-avatar>
                                      <div class="profile-info">
              <h2 class="profile-name">{{ user?.username }}</h2>
              <p class="profile-email">{{ user?.email }}</p>
              
              <!-- Role and Status Info -->
              <div class="profile-status">
                <span class="role-badge" [class.admin]="user?.role === 'Admin'">
                  {{ user?.role }}
                </span>
                <span class="status-badge" *ngIf="user?.status">
                  {{ user?.status }}
                </span>
              </div>

              <!-- Suspension Warning -->
              <div class="suspension-warning" *ngIf="user?.isSuspended">
                <i class="pi pi-exclamation-triangle"></i>
                <span>Account Suspended</span>
                <p *ngIf="user?.suspensionReason" class="suspension-reason">
                  Reason: {{ user?.suspensionReason }}
                </p>
                <p *ngIf="user?.suspendedUntil" class="suspension-until">
                  Until: {{ user?.suspendedUntil | date:'medium' }}
                </p>
              </div>

              <p-button 
                label="Edit Profile" 
                icon="pi pi-user-edit"
                [text]="true"
                styleClass="p-button-secondary"
                routerLink="/profile/{{user?.id}}/edit"
              ></p-button>
            </div>
          </div>
        </ng-container>
        
        <ng-template #loadingUser>
          <div class="profile-header-content">
            <div class="loading-avatar"></div>
            <div class="profile-info">
              <div class="loading-name"></div>
              <div class="loading-email"></div>
              <p-button 
                label="Edit Profile" 
                icon="pi pi-user-edit"
                [text]="true"
                styleClass="p-button-secondary"
                routerLink="/profile/edit"
                [disabled]="true"
              ></p-button>
            </div>
          </div>
        </ng-template>
      </div>

      <!-- Navigation Buttons -->
      <div class="profile-nav-buttons">
        <p-button 
          *ngFor="let tab of tabs; let i = index"
          [label]="tab.label"
          [icon]="tab.icon"
          [styleClass]="getTabButtonClass(i)"
          (onClick)="onTabChange(i)"
          class="tab-button"
        ></p-button>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <!-- My Posts Tab -->
        <div *ngIf="activeTabIndex === 0">
          <div class="posts-grid">
            <ng-container *ngIf="!isLoadingUserPosts; else loadingUserPosts">
              <ng-container *ngIf="userPosts.length > 0; else noUserPosts">
                <app-post-card 
                  *ngFor="let post of userPosts" 
                  [post]="post"
                ></app-post-card>
              </ng-container>
            </ng-container>
          </div>

          <ng-template #loadingUserPosts>
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Loading your posts...</p>
            </div>
          </ng-template>

          <ng-template #noUserPosts>
            <div class="no-posts-content">
              <h3>No posts yet</h3>
              <p>Share your thoughts with the world!</p>
              <p-button 
                label="Create Your First Post" 
                icon="pi pi-plus"
                routerLink="/posts/new"
                styleClass="p-button-primary"
              ></p-button>
            </div>
          </ng-template>
        </div>

        <!-- Liked Posts Tab -->
        <div *ngIf="activeTabIndex === 1">
          <div class="posts-grid">
            <ng-container *ngIf="!isLoadingLikedPosts; else loadingLikedPosts">
              <ng-container *ngIf="likedPosts.length > 0; else noLikedPosts">
                <app-post-card 
                  *ngFor="let post of likedPosts" 
                  [post]="post"
                  (unlike)="handlePostUnlike(post.id)"
                ></app-post-card>
              </ng-container>
            </ng-container>
          </div>

          <ng-template #loadingLikedPosts>
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Loading liked posts...</p>
            </div>
          </ng-template>

          <ng-template #noLikedPosts>
            <div class="no-posts-content">
              <h3>No liked posts yet</h3>
              <p>Explore and like posts to see them here!</p>
              <p-button 
                label="Explore Posts" 
                icon="pi pi-compass"
                routerLink="/posts"
                styleClass="p-button-primary"
              ></p-button>
            </div>
          </ng-template>
        </div>

        <!-- Commented Posts Tab -->
        <div *ngIf="activeTabIndex === 2">
          <div class="posts-grid">
            <ng-container *ngIf="!isLoadingCommentedPosts; else loadingCommentedPosts">
              <ng-container *ngIf="commentedPosts.length > 0; else noCommentedPosts">
                <app-post-card 
                  *ngFor="let post of commentedPosts" 
                  [post]="post"
                ></app-post-card>
              </ng-container>
            </ng-container>
          </div>

          <ng-template #loadingCommentedPosts>
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Loading commented posts...</p>
            </div>
          </ng-template>

          <ng-template #noCommentedPosts>
            <div class="no-posts-content">
              <h3>No commented posts yet</h3>
              <p>Start engaging with posts by adding your comments!</p>
              <p-button 
                label="Explore Posts" 
                icon="pi pi-comments"
                routerLink="/posts"
                styleClass="p-button-primary"
              ></p-button>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-header-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .profile-header-content {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .profile-info {
      flex: 1;
    }

    .profile-name {
      margin: 0;
      font-size: 1.8rem;
      color: var(--text-color);
    }

    .profile-email {
      margin: 0.5rem 0 1rem;
      color: var(--text-color-secondary);
    }

    .profile-status {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      background: #e9ecef;
      color: #6c757d;
    }

    .role-badge.admin {
      background: #dc3545;
      color: white;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #28a745;
      color: white;
    }

    .suspension-warning {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      color: #856404;
    }

    .suspension-warning i {
      margin-right: 0.5rem;
      color: #f39c12;
    }

    .suspension-warning span {
      font-weight: 600;
      font-size: 1rem;
    }

    .suspension-warning p {
      margin: 0.5rem 0 0;
      font-size: 0.875rem;
    }

    .suspension-reason {
      font-style: italic;
    }

    .suspension-until {
      font-weight: 500;
    }

    .profile-nav-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    /* Enhanced tab button styles */
    ::ng-deep .profile-nav-buttons {
      .tab-button {
        flex: 1;
        min-width: 160px;
        max-width: 200px;
      }

      .p-button {
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        position: relative;
        overflow: hidden;
        
        /* Default (inactive) state */
        background: transparent;
        color: #6c757d;
        border: 2px solid transparent;
        box-shadow: none;

        /* Hover effect for inactive buttons */
        &:hover:not(.active-tab) {
          background: rgba(108, 117, 125, 0.1);
          color: #495057;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Active tab styling */
        &.active-tab {
          background: #ffffff;
          color: #2196F3;
          border: 2px solid #2196F3;
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
          font-weight: 600;
          transform: translateY(-2px);

          /* Active tab glow effect */
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05));
            border-radius: 6px;
            z-index: -1;
          }

          /* Prevent hover effects on active tab */
          &:hover {
            background: #ffffff;
            color: #2196F3;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(33, 150, 243, 0.2);
          }
        }

        /* Icon styling */
        .p-button-icon {
          font-size: 1.1rem;
          margin-right: 0.5rem;
          transition: all 0.3s ease;
        }

        /* Label styling */
        .p-button-label {
          font-size: 0.95rem;
          letter-spacing: 0.025em;
        }

        /* Focus states for accessibility */
        &:focus {
          outline: 2px solid #2196F3;
          outline-offset: 2px;
        }

        /* Active state animation */
        &.active-tab .p-button-icon {
          color: #2196F3;
          transform: scale(1.1);
        }

        /* Pressed state */
        &:active {
          transform: translateY(0);
        }
      }
    }

    /* Responsive design for tab buttons */
    @media (max-width: 768px) {
      .profile-nav-buttons {
        flex-direction: column;
        gap: 0.5rem;
      }

      ::ng-deep .profile-nav-buttons .tab-button {
        min-width: 100%;
        max-width: 100%;
      }
    }

    .content-area {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 1rem 0;
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
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-posts-content {
      text-align: center;
      padding: 40px;
      background: #f9f9f9;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .no-posts-content h3 {
      margin: 0 0 1rem;
      color: var(--text-color);
    }

    .no-posts-content p {
      margin: 0 0 1.5rem;
      color: var(--text-color-secondary);
    }

    /* Loading states */
    .loading-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    .loading-name {
      width: 150px;
      height: 28px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .loading-email {
      width: 200px;
      height: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  userPosts: Post[] = [];
  likedPosts: Post[] = [];
  commentedPosts: Post[] = [];
  isLoadingUserPosts = false;
  isLoadingLikedPosts = false;
  isLoadingCommentedPosts = false;
  isLoadingUser = false;
  activeTabIndex = 0;
  private postUpdateSubscription: Subscription | null = null;

  tabs = [
    {
      label: 'My Posts',
      icon: 'pi pi-file'
    },
    {
      label: 'Liked Posts',
      icon: 'pi pi-heart'
    },
    {
      label: 'Commented Posts',
      icon: 'pi pi-comments'
    }
  ];

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id');
      if (userId) {
        this.loadUserData(userId);
        this.loadUserPosts(userId);
      } else {
        // If no userId in route, redirect to current user's profile
        const currentUserId = this.authService.getCurrentUserId();
        if (currentUserId) {
          this.router.navigate(['/profile', currentUserId]);
        }
      }
    });
    
    // Restore active tab from localStorage if exists
    const savedTabIndex = localStorage.getItem('profileActiveTab');
    if (savedTabIndex !== null) {
      this.activeTabIndex = parseInt(savedTabIndex, 10);
    }

    // Subscribe to post updates
    this.postUpdateSubscription = this.postService.postUpdate$.subscribe(update => {
      if (update.type === 'unlike' && this.activeTabIndex === 1) {
        // Remove the unliked post from liked posts
        this.likedPosts = this.likedPosts.filter(post => post.id !== update.postId);
      } else if (update.type === 'uncomment' && this.activeTabIndex === 2) {
        // Remove the uncommented post from commented posts if it was the last comment
        this.loadCommentedPosts();
      }
    });
  }

  ngOnDestroy() {
    if (this.postUpdateSubscription) {
      this.postUpdateSubscription.unsubscribe();
    }
  }

  private loadUserData(userId?: string) {
    const targetUserId = userId || this.authService.getCurrentUserId();
    if (!targetUserId) {
      this.isLoadingUser = false;
      return;
    }

    this.isLoadingUser = true;
    this.userService.getUserById(targetUserId).subscribe({
      next: (userData) => {
        this.user = userData;
        this.isLoadingUser = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.isLoadingUser = false;
      }
    });
  }

  onTabChange(index: number) {
    this.activeTabIndex = index;
    // Save active tab to localStorage
    localStorage.setItem('profileActiveTab', index.toString());
    this.loadTabContent(index);
  }

  // Method to get the appropriate CSS class for tab buttons
  getTabButtonClass(index: number): string {
    return this.activeTabIndex === index ? 'active-tab' : 'inactive-tab';
  }

  private loadTabContent(tabIndex: number) {
    const userId = this.route.snapshot.paramMap.get('id');
    switch (tabIndex) {
      case 0:
        this.loadUserPosts(userId || undefined);
        break;
      case 1:
        this.loadLikedPosts();
        break;
      case 2:
        this.loadCommentedPosts();
        break;
    }
  }

  handlePostUnlike(postId: string) {
    // Remove the unliked post immediately from the UI
    this.likedPosts = this.likedPosts.filter(post => post.id !== postId);
  }

  private async loadUserPosts(userId?: string) {
    const targetUserId = userId || this.route.snapshot.paramMap.get('id');
    if (!targetUserId) {
      this.isLoadingUserPosts = false;
      return;
    }

    try {
      this.isLoadingUserPosts = true;
      this.userService.getPostsByUser(targetUserId).subscribe({
        next: (posts) => {
          this.userPosts = posts;
          this.isLoadingUserPosts = false;
        },
        error: (error) => {
          console.error('Error loading user posts:', error);
          this.isLoadingUserPosts = false;
        }
      });
    } catch (error) {
      this.isLoadingUserPosts = false;
    }
  }

  private async loadLikedPosts() {
    if (!this.authService.getCurrentUserId()) return;

    try {
      this.isLoadingLikedPosts = true;
      this.likedPosts = await this.postService.getLikedPosts();
    } catch (error) {
      // Handle error silently
    } finally {
      this.isLoadingLikedPosts = false;
    }
  }

  private async loadCommentedPosts() {
    if (!this.authService.getCurrentUserId()) return;

    try {
      this.isLoadingCommentedPosts = true;
      this.commentedPosts = await this.postService.getCommentedPosts();
    } catch (error) {
      // Handle error silently
    } finally {
      this.isLoadingCommentedPosts = false;
    }
  }
}