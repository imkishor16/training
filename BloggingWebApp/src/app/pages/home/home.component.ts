import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    PostCardComponent,
    ProgressSpinnerModule
  ],
  template: `
    <div class="p-4">
      <div class="container">
        <div *ngIf="loading" class="flex justify-content-center align-items-center" style="min-height: 400px;">
          <p-progressSpinner></p-progressSpinner>
        </div>

        <div *ngIf="!loading" class="grid">
          <div *ngFor="let post of posts" class="col-12 md:col-6 lg:col-4">
            <app-post-card [post]="post"></app-post-card>
          </div>

          <div *ngIf="posts.length === 0" class="col-12 text-center">
            <h2>No posts found</h2>
            <p>Be the first one to create a post!</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  loading = true;

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.loading = false;
      }
    });
  }
} 