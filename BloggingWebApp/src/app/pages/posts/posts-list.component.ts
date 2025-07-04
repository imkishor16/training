import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
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
        <a routerLink="/posts/new" class="create-button">Create New Post</a>
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
            <a routerLink="/posts/new" class="create-button">Create Your First Post</a>
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
  `]
})
export class PostsListComponent implements OnInit {
  posts: Post[] | null = null;
  isLoading = true;

  constructor(private postService: PostService) {}

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
} 