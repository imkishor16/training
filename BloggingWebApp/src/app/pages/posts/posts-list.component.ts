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

      <div class="posts-grid" *ngIf="posts.length > 0; else noPosts">
        <app-post-card 
          *ngFor="let post of posts" 
          [post]="post"
        ></app-post-card>
      </div>

      <ng-template #noPosts>
        <div class="no-posts">
          <p>No posts found. Be the first to create a post!</p>
          <a routerLink="/posts/new" class="create-button">Create Post</a>
        </div>
      </ng-template>
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

    .no-posts {
      text-align: center;
      padding: 40px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .no-posts p {
      margin-bottom: 20px;
      color: var(--text-color-secondary);
    }
  `]
})
export class PostsListComponent implements OnInit {
  posts: Post[] = [];

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }
} 