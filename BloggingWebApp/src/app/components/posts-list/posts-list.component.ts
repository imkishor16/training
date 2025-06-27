import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { Post, PostStatus } from '../../models/post.model';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    PostCardComponent
],
  template: `
    <div class="max-w-7xl mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Posts</h1>
        @if (isLoggedIn) {
          <button
            mat-raised-button
            color="primary"
            (click)="createPost()"
            >
            <mat-icon>add</mat-icon>
            Create Post
          </button>
        }
      </div>
    
      @if (loading) {
        <div class="flex justify-center items-center py-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }
    
      @if (!loading && posts.length === 0) {
        <div class="text-center py-8">
          <p class="text-gray-600">No posts found</p>
        </div>
      }
    
      @if (!loading && posts.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (post of posts; track post) {
            <app-post-card
              [post]="post"
              [isLoggedIn]="isLoggedIn"
              [isAdmin]="isAdmin"
              (likeToggled)="toggleLike($event)"
              (statusChanged)="changeStatus($event.post, $event.status)"
              (deletePost)="deletePost($event)"
              (viewPost)="viewPost($event)"
            ></app-post-card>
          }
        </div>
      }
    </div>
    `
})
export class PostsListComponent implements OnInit {
  posts: Post[] = [];
  loading = true;
  isLoggedIn = false;

  constructor(
    private router: Router,
    private postService: PostService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadPosts();
  }

  get isAdmin(): boolean {
    return this.authService.getCurrentUserRole() === 'Admin';
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getPosts().subscribe({
      next: (posts: Post[]) => {
        // For non-admin users, only show Published posts
        this.posts = this.isAdmin 
          ? posts 
          : posts.filter(post => post.postStatus === 'Published');
        this.loading = false;
      },
      error: (error: any) => {
        this.messageService.showError('Error', 'Failed to load posts');
        this.loading = false;
      }
    });
  }

  createPost(): void {
    this.router.navigate(['/posts/create']);
  }

  viewPost(id: string): void {
    this.router.navigate(['/post', id]);
  }

  toggleLike(post: Post): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth']);
      return;
    }

    const action = post.isLikedByCurrentUser ? 'unlike' : 'like';
    this.postService.toggleLike(post.id).subscribe({
      next: (updatedPost: Post) => {
        const index = this.posts.findIndex(p => p.id === post.id);
        if (index !== -1) {
          this.posts[index] = updatedPost;
        }
      },
      error: (error: any) => {
        this.messageService.showError('Error', `Failed to ${action} post`);
      }
    });
  }

  changeStatus(post: Post, newStatus: PostStatus): void {
    if (!this.isAdmin) return;

    this.postService.updatePost(post.id, { postStatus: newStatus }).subscribe({
      next: (updatedPost) => {
        const index = this.posts.findIndex(p => p.id === post.id);
        if (index !== -1) {
          this.posts[index] = updatedPost;
        }
        this.messageService.showSuccess('Success', `Post status changed to ${newStatus}`);
      },
      error: (error) => {
        this.messageService.showError('Error', 'Failed to update post status');
      }
    });
  }

  deletePost(post: Post): void {
    if (!this.isAdmin || !confirm('Are you sure you want to delete this post?')) return;

    this.postService.deletePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
        this.messageService.showSuccess('Success', 'Post deleted successfully');
      },
      error: (error) => {
        this.messageService.showError('Error', 'Failed to delete post');
      }
    });
  }
} 