import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { PostCardComponent } from '../../components/post-card/post-card.component';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PostCardComponent
  ],
  template: `
    <div class="posts-container">
      <div class="header">
        <h1>Posts</h1>
        <button (click)="createNewPost()" class="create-button">Create New Post</button>
      </div>

      <!-- Suspension Alert -->
      <div *ngIf="showSuspensionAlert" class="suspension-alert">
        <div class="alert-content">
          <h3>Account Suspended</h3>
          <p><strong>Reason:</strong> {{ suspensionReason }}</p>
          <p *ngIf="suspendedUntil"><strong>Suspended until:</strong> {{ suspendedUntil | date:'medium' }}</p>
          <button (click)="closeSuspensionAlert()" class="alert-close-btn">Close</button>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>

      <div *ngIf="!isLoading && posts" class="posts-grid" [class.no-posts]="!posts.length">
        <ng-container *ngIf="posts.length > 0; else noPosts">
          <app-post-card 
            *ngFor="let post of posts" 
            [post]="post"
          ></app-post-card>
        </ng-container>

        <ng-template #noPosts>
          <div class="no-posts-content">
            <p>No posts available yet.</p>
            <button (click)="createNewPost()" class="create-button">Create Your First Post</button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .posts-container {
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

    .create-button {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border-radius: 4px;
      text-decoration: none;
      transition: background-color 0.2s;
      border: none;
      cursor: pointer;
    }

    .create-button:hover {
      background-color: #0056b3;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
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

    .no-posts-content {
      text-align: center;
      padding: 40px;
      background: #f9f9f9;
      border-radius: 8px;
      grid-column: 1 / -1;
    }

    .no-posts-content p {
      margin-bottom: 20px;
      color: var(--text-color-secondary);
      font-size: 1.1em;
    }

    .suspension-alert {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .alert-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .alert-content h3 {
      color: #dc3545;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .alert-content p {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .alert-close-btn {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .alert-close-btn:hover {
      background: #5a6268;
    }
  `]
})
export class PostsListComponent implements OnInit {
  posts: Post[] | null = null;
  isLoading = true;
  showSuspensionAlert = false;
  suspensionReason = '';
  suspendedUntil: Date | null = null;

  constructor(
    private postService: PostService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.posts = [];
        this.isLoading = false;
      }
    });
  }

  createNewPost() {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      console.error('No user ID found');
      return;
    }

    // Check if user is suspended before allowing post creation
    this.userService.getUserById(currentUserId).subscribe({
      next: (user) => {
        if (user.isSuspended) {
          // Show suspension alert
          this.suspensionReason = user.suspensionReason || 'No reason provided';
          this.suspendedUntil = user.suspendedUntil ? new Date(user.suspendedUntil) : null;
          this.showSuspensionAlert = true;
        } else {
          // User is not suspended, proceed to create post
          this.router.navigate(['/posts/new']);
        }
      },
      error: (error) => {
        console.error('Error checking user suspension status:', error);
        // If we can't check suspension status, allow the user to proceed
        this.router.navigate(['/posts/new']);
      }
    });
  }

  closeSuspensionAlert() {
    this.showSuspensionAlert = false;
  }
} 