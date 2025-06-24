import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { MessageService } from '../../services/message.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white shadow rounded-lg p-6">
      <!-- Back Button -->
      <div class="mb-6">
        <button 
          (click)="goBack()" 
          class="inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Posts
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-lg text-gray-600">Loading post...</span>
        </div>
      </div>

      <!-- Post Content -->
      <div *ngIf="!loading && post" class="max-w-4xl mx-auto">
        <!-- Post Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {{ post.postStatus }}
            </span>
            <span class="text-sm text-gray-500">
              {{ post.createdAt | date:'fullDate' }}
            </span>
          </div>
          
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            {{ post.title }}
          </h1>
          
          <div class="flex items-center text-gray-600 mb-6">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="font-medium">{{ post.user?.username || 'Anonymous' }}</span>
            <span class="mx-2">•</span>
            <span>{{ post.comments?.length || 0 }} comments</span>
          </div>
        </div>

        <!-- Post Images -->
        <div *ngIf="post.images && post.images.length > 0" class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              *ngFor="let image of post.images" 
              class="relative overflow-hidden rounded-lg"
            >
              <img 
                [src]="image.url" 
                [alt]="image.altText || 'Post image'"
                class="w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>

        <!-- Post Content -->
        <div class="prose prose-lg max-w-none mb-8">
          <div class="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {{ post.content }}
          </div>
        </div>

        <!-- Comments Section -->
        <div class="border-t border-gray-200 pt-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">
            Comments ({{ post.comments?.length || 0 }})
          </h3>
          
          <div *ngIf="post.comments && post.comments.length > 0" class="space-y-6">
            <div 
              *ngFor="let comment of post.comments" 
              class="bg-gray-50 rounded-lg p-4"
            >
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-indigo-600">
                      {{ comment.user?.username?.charAt(0) || 'A' }}
                    </span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="text-sm font-medium text-gray-900">
                      {{ comment.user?.username || 'Anonymous' }}
                    </span>
                    <span class="text-sm text-gray-500">
                      {{ comment.createdAt | date:'short' }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700">
                    {{ comment.content }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="!post.comments || post.comments.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
            <p class="mt-1 text-sm text-gray-500">Be the first to share your thoughts!</p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && !post" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Post not found</h3>
        <p class="mt-1 text-sm text-gray-500">The post you're looking for doesn't exist or has been removed.</p>
        <div class="mt-6">
          <button 
            (click)="goBack()" 
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go back to posts
          </button>
        </div>
      </div>
    </div>
  `
})
export class PostComponent implements OnInit {
  post: Post | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const postId = params['id'];
      if (postId) {
        this.loadPost(postId);
      }
    });
  }

  loadPost(postId: string): void {
    this.loading = true;
    this.postService.getPostById(postId).subscribe({
      next: (response) => {
        this.loading = false;
        this.post = response.post;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.showHttpError(error);
        this.post = null;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }
} 