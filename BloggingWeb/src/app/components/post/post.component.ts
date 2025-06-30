import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { MessageService } from '../../services/message.service';
import { Post, Comment, Image, Like } from '../../models/post.model';
import { AuthService } from '../../services/auth.service';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [NO_ERRORS_SCHEMA],
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
            <div class="flex items-center space-x-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {{ post.postStatus }}
              </span>
              <!-- Edit Button - Only show if user is the author -->
              <button
                *ngIf="canModify"
                (click)="editPost()"
                class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit Post
              </button>
            </div>
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
            <span class="font-medium">{{ post.user?.name || post.user?.username || 'Anonymous' }}</span>
            <span class="mx-2">•</span>
            <span>{{ comments.length }} comments</span>
            <span class="mx-2">•</span>
            <span>{{ post.likesCount || 0 }} likes</span>
          </div>
          <!-- Like Button -->
          <div *ngIf="isLoggedIn" class="flex items-center mb-6">
            <button
              (click)="toggleLike()"
              class="inline-flex items-center px-4 py-2 border rounded-md"
              [class.bg-red-100]="post.isLikedByCurrentUser"
              [class.border-red-300]="post.isLikedByCurrentUser"
              [class.text-red-700]="post.isLikedByCurrentUser"
              [class.bg-gray-100]="!post.isLikedByCurrentUser"
              [class.border-gray-300]="!post.isLikedByCurrentUser"
              [class.text-gray-700]="!post.isLikedByCurrentUser"
              >
              <svg
                class="h-5 w-5 mr-2"
                [class.text-red-500]="post.isLikedByCurrentUser"
                [class.text-gray-500]="!post.isLikedByCurrentUser"
                fill="currentColor"
                viewBox="0 0 20 20"
                >
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
              {{ post.isLikedByCurrentUser ? 'Unlike' : 'Like' }}
            </button>
          </div>
          <!-- Post Images -->
          <div *ngIf="images.length > 0" class="mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                *ngFor="let image of images"
                class="relative overflow-hidden rounded-lg"
                >
                <img
                  [src]="getImageSrc(image)"
                  [alt]="image.name"
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
              Comments ({{ comments.length }})
            </h3>
            <!-- Add Comment Form -->
            <div *ngIf="isLoggedIn" class="mb-8">
              <form (ngSubmit)="submitComment()" class="space-y-4">
                <div>
                  <label for="comment" class="block text-sm font-medium text-gray-700">Add a comment</label>
                  <div class="mt-1">
                    <textarea
                      id="comment"
                      name="comment"
                      rows="3"
                      [(ngModel)]="newCommentContent"
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Share your thoughts..."
                    ></textarea>
                  </div>
                </div>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    [disabled]="!newCommentContent.trim()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
            <div *ngIf="comments.length > 0" class="space-y-6">
              <div
                *ngFor="let comment of comments"
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
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-900">
                          {{ comment.user?.username || 'Anonymous' }}
                        </span>
                        <span class="text-sm text-gray-500">
                          {{ comment.createdAt | date:'short' }}
                        </span>
                      </div>
                      <!-- Edit/Delete buttons - Only show if user is the author -->
                      <div *ngIf="isCommentAuthor(comment)" class="flex space-x-2">
                        <button
                          *ngIf="!comment.isEditing"
                          (click)="startEditingComment(comment)"
                          class="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                          Edit
                        </button>
                        <button
                          *ngIf="comment.isEditing"
                          (click)="cancelEditingComment(comment)"
                          class="text-sm text-gray-600 hover:text-gray-800"
                          >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <!-- Comment Content / Edit Form -->
                    <div *ngIf="!comment.isEditing" class="text-sm text-gray-700">
                      {{ comment.content }}
                    </div>
                    <div *ngIf="comment.isEditing" class="mt-2">
                      <textarea
                        [(ngModel)]="comment.editContent"
                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        rows="3"
                      ></textarea>
                      <div class="mt-2 flex justify-end space-x-2">
                        <button
                          (click)="updateComment(comment)"
                          class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="comments.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
              <p class="mt-1 text-sm text-gray-500">Be the first to share your thoughts!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PostComponent implements OnInit {
  post: Post | null = null;
  loading = false;
  comments: Comment[] = [];
  images: Image[] = [];
  likes: Like[] = [];
  isLoggedIn = false;
  isCurrentUserAuthor = false;
  newCommentContent = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private messageService: MessageService,
    private authService: AuthService,
    private commentService: CommentService
  ) {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

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
        this.post = response;
        this.checkIfCurrentUserIsAuthor();
        this.loadComments(postId);
        this.loadImages(postId);
        this.loadLikes(postId);
      },
      error: (error) => {
        this.loading = false;
        this.messageService.showHttpError(error);
        this.post = null;
      }
    });
  }

  checkIfCurrentUserIsAuthor(): void {
    if (this.post && this.isLoggedIn) {
      const currentUserId = this.authService.getCurrentUserId();
      this.isCurrentUserAuthor = currentUserId === this.post.userId;
    } else {
      this.isCurrentUserAuthor = false;
    }
  }

  editPost(): void {
    if (this.post && this.isCurrentUserAuthor) {
      this.router.navigate(['/posts/edit', this.post.id]);
    }
  }

  loadComments(postId: string): void {
    this.postService.getPostComments(postId).subscribe({
      next: (comments) => {
        this.comments = comments || [];
      },
      error: () => {
        this.comments = [];
      }
    });
  }

  loadImages(postId: string): void {
    this.postService.getPostImages(postId).subscribe({
      next: (images) => {
        this.images = images || [];
      },
      error: () => {
        this.images = [];
      }
    });
  }

  loadLikes(postId: string): void {
    this.postService.getPostLikes(postId).subscribe({
      next: (likes) => {
        this.likes = likes || [];
        if (this.post) {
          this.post.likesCount = likes.length;
          this.post.isLikedByCurrentUser = likes.some(like => 
            like.userId === this.authService.getCurrentUserId()
          );
        }
      },
      error: () => {
        this.likes = [];
      }
    });
  }

  toggleLike(): void {
    if (!this.post || !this.isLoggedIn) return;

    const action = this.post.isLikedByCurrentUser 
      ? this.postService.unlikePost(this.post.id)
      : this.postService.likePost(this.post.id);

    action.subscribe({
      next: () => {
        if (this.post) {
          this.post.isLikedByCurrentUser = !this.post.isLikedByCurrentUser;
          this.post.likesCount = (this.post.likesCount || 0) + (this.post.isLikedByCurrentUser ? 1 : -1);
        }
      },
      error: (error) => {
        this.messageService.showHttpError(error);
      }
    });
  }

  getImageSrc(image: Image): string {
    return image.content ? this.postService.convertImageContent(image.content) : '';
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }

  submitComment(): void {
    if (!this.post || !this.isLoggedIn || !this.newCommentContent.trim()) return;

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.messageService.showError('Error', 'User not authenticated');
      return;
    }

    this.commentService.addComment(this.post.id, this.newCommentContent, userId).subscribe({
      next: (newComment) => {
        this.comments.unshift(newComment);
        this.newCommentContent = '';
        this.messageService.showSuccess('Comment added successfully', 'Comment added successfully');
      },
      error: (error) => {
        this.messageService.showHttpError(error);
      }
    });
  }

  isCommentAuthor(comment: Comment): boolean {
    if (!this.isLoggedIn) return false;
    const currentUserId = this.authService.getCurrentUserId();
    return currentUserId === comment.userId;
  }

  startEditingComment(comment: Comment): void {
    comment.isEditing = true;
    comment.editContent = comment.content;
  }

  cancelEditingComment(comment: Comment): void {
    comment.isEditing = false;
    comment.editContent = comment.content;
  }

  updateComment(comment: Comment): void {
    if (!comment.editContent?.trim()) return;

    this.commentService.updateComment(comment.id, { content: comment.editContent, status: 'Approved' }).subscribe({
      next: (updatedComment) => {
        const index = this.comments.findIndex(c => c.id === comment.id);
        if (index !== -1) {
          this.comments[index] = { ...updatedComment, isEditing: false };
        }
        this.messageService.showSuccess('Comment updated successfully', 'Comment updated successfully');
      },
      error: (error) => {
        this.messageService.showHttpError(error);
        comment.isEditing = false;
        comment.editContent = comment.content;
      }
    });
  }


  get canModify(): boolean {
    return this.isAdmin || (this.post?.userId === this.authService.getCurrentUserId());
  }

  get isAdmin(): boolean {
    return this.authService.getCurrentUserRole() === 'Admin';
  }

  onDelete(): void {
    if (this.post && confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(this.post.id).subscribe({
        next: () => {
          this.messageService.showSuccess('Success', 'Post deleted successfully');
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          this.messageService.showHttpError(error);
        }
      });
    }
  }
} 