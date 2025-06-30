import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Welcome back, {{ username }}!</h1>
      </header>

      <section class="dashboard-stats">
        <div class="stat-card">
          <h3>Your Posts</h3>
          <p class="stat-number">{{ userPosts.length }}</p>
        </div>
      </section>

      <section class="dashboard-actions">
        <a routerLink="/posts/new" class="action-button">Create New Post</a>
        <a routerLink="/profile" class="action-button secondary">View Profile</a>
      </section>

      <section class="recent-posts" *ngIf="userPosts.length > 0">
        <h2>Your Recent Posts</h2>
        <div class="posts-grid">
          <div *ngFor="let post of userPosts" class="post-card">
            <h3>{{ post.title }}</h3>
            <p>{{ post.content.substring(0, 100) }}...</p>
            <div class="post-actions">
              <a [routerLink]="['/posts', post.id]" class="post-link">View</a>
              <a [routerLink]="['/posts', post.id, 'edit']" class="post-link">Edit</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      color: #333;
    }

    .dashboard-stats {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
    }

    .dashboard-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .action-button {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }

    .action-button:not(.secondary) {
      background: #007bff;
      color: white;
    }

    .action-button.secondary {
      background: #e9ecef;
      color: #333;
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .recent-posts {
      margin-top: 2rem;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .post-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .post-card h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .post-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .post-link {
      color: #007bff;
      text-decoration: none;
    }

    .post-link:hover {
      text-decoration: underline;
    }
  `]
})
export class DashboardComponent implements OnInit {
  username: string = '';
  userPosts: Post[] = [];

  constructor(
    private authService: AuthService,
    private postService: PostService
  ) {}

  ngOnInit() {
    // Get user info
    const user = this.authService.getCurrentUser();
    this.username = user?.username || 'User';

    // Get user's posts
    this.loadUserPosts();
  }

  private async loadUserPosts() {
    try {
      // Assuming postService has a method to get user's posts
      this.userPosts = await this.postService.getUserPosts();
    } catch (error) {
      console.error('Error loading user posts:', error);
      this.userPosts = [];
    }
  }
} 