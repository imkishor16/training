import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl, SafeHtml } from '@angular/platform-browser';
import { Post, Comment } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="post-container" *ngIf="post">
      <article class="post-content">
        <!-- Author Info -->
        <div class="post-author">
          <div class="author-avatar">{{ post.user?.username?.charAt(0) || 'U' }}</div>
          <div class="author-info">
            <span class="author-name">{{ post.user?.username || 'Anonymous' }}</span>
            <span class="post-status" [class]="getStatusClass(post.postStatus)">
              {{ post.postStatus }}
            </span>
          </div>
        </div>

        <!-- Post Title -->
        <h1 class="post-title">{{ post.title }}</h1>

        <!-- Cover Image -->
        <div class="cover-image" *ngIf="post.images && post.images.length > 0">
          <img 
            [src]="getImageUrl(post.images[0])"
            [alt]="post.title"
            class="post-cover-image"
            (error)="onImageError($event)"
          />
        </div>

        <!-- Post Content -->
        <div class="post-text" [innerHTML]="getProcessedContent()"></div>

        <!-- Likes Section -->
        <div class="post-actions">
          <button 
            class="like-button"
            (click)="toggleLike()"
            [class.liked]="isLiked"
            [disabled]="!isAuthenticated"
          >
            <span class="like-icon">♥</span>
            <span class="like-count">{{ getActiveLikesCount() }} Likes</span>
          </button>
        </div>

        <hr class="divider">

        <!-- Comments Section -->
        <div class="comments-section">
          <h2 class="comments-title">Comments ({{ post.comments?.length || 0 }})</h2>

          <!-- Comment Form -->
          <div *ngIf="isAuthenticated" class="comment-form-container">
            <div class="current-user">
              <div class="user-avatar">
                {{ authService.getCurrentUser()?.username?.charAt(0) || 'U' }}
              </div>
              <span class="user-name">{{ authService.getCurrentUser()?.username }}</span>
            </div>
            <form [formGroup]="commentForm" (ngSubmit)="submitComment()">
              <div class="form-group">
                <textarea 
                  class="comment-input"
                  formControlName="content"
                  placeholder="Write a comment..."
                  rows="3"
                  [class.error]="commentForm.get('content')?.invalid && commentForm.get('content')?.touched"
                ></textarea>
                <div 
                  class="error-message" 
                  *ngIf="commentForm.get('content')?.invalid && commentForm.get('content')?.touched"
                >
                  Please enter a comment
                </div>
                <button 
                  type="submit" 
                  class="submit-button"
                  [disabled]="!commentForm.valid || commentForm.pristine"
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>

          <!-- Comments List -->
          <div class="comments-list">
            <div *ngFor="let comment of post.comments" class="comment">
              <div class="comment-header">
                <div class="comment-avatar">
                  {{ comment.user?.username?.charAt(0) || 'U' }}
                </div>
                <div class="comment-meta">
                  <span class="comment-author">{{ comment.user?.username || 'Anonymous' }}</span>
                  <span class="comment-date" *ngIf="comment.createdAt">
                    {{ comment.createdAt | date:'medium' }}
                  </span>
                </div>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </div>
            
            <div *ngIf="!post.comments?.length" class="no-comments">
              No comments yet. Be the first to comment!
            </div>
          </div>
        </div>
      </article>
    </div>
  `,
  styleUrls: ['./post-detail.component.css']
})
export class PostComponent implements OnInit {
  post: Post | null = null;
  commentForm: FormGroup;
  isAuthenticated = false;
  isLiked = false;
  private currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private commentService: CommentService,
    public authService: AuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]]
    });
  }

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUserId = this.authService.getCurrentUserId();
    
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(postId);
    }
  }

  loadPost(postId: string) {
    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        this.post = post;
        this.checkIfLiked();
      },
      error: (error) => {
        console.error('Error loading post:', error);
      }
    });
  }

  getImageUrl(image: { content: any }): string {
    const dataUrl = this.convertImageToDataUrl(image);
    return dataUrl || 'https://via.placeholder.com/800x400?text=No+Image';
  }

  getProcessedContent(): SafeHtml {
    if (!this.post?.content) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
  
    const contentImages = this.post.images || [];
  
    const processed = this.post.content.replace(
      /<img[^>]*src="\[IMAGE_PLACEHOLDER:image_\d+_(\d+)\]"[^>]*>/g,
      (match, indexStr) => {
        const imageIndex = parseInt(indexStr, 10);
  
        if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= contentImages.length) {
          console.warn(`Invalid image index: ${imageIndex}, available images: ${contentImages.length}`);
          return `<div class="missing-image" style="color: red; font-style: italic;">Image not found (index: ${imageIndex})</div>`;
        }
  
        const image = contentImages[imageIndex];
        const imageUrl = this.getImageUrl(image); 
  
        // Extract any existing style attributes to preserve them
        const existingStyleMatch = match.match(/style="([^"]*)"/);
        const existingStyle = existingStyleMatch ? existingStyleMatch[1] : '';
  
        // Merge or append additional inline styles
        const mergedStyle = `${existingStyle}; max-width: 100%; height: auto; display: block; margin: 1rem 0; border-radius: 8px;`;
  
        // Extract other attributes (optional width/height)
        const otherAttributes = match.match(/(width|height)="[^"]*"/g)?.join(' ') ?? '';
  
        return `<img src="${imageUrl}" style="${mergedStyle}" ${otherAttributes} class="content-image" loading="lazy">`;
      }
    );
  
    return this.sanitizer.bypassSecurityTrustHtml(processed);
  }
  

  private convertImageToDataUrl(image: { content: any }): string | null {
    try {
      if (!image || !image.content) {
        return null;
      }

      // Handle different image content types
      if (typeof image.content === 'string') {
        // Check if it's already a data URL
        if (image.content.startsWith('data:image/')) {
          return image.content;
        }
        
        // Try to handle base64 string
        if (this.isBase64String(image.content)) {
          return `data:image/jpeg;base64,${image.content}`;
        }
        
        // Try to decode base64 if it's not properly formatted
        try {
          const decoded = atob(image.content);
          const bytes = new Uint8Array(decoded.length);
          for (let i = 0; i < decoded.length; i++) {
            bytes[i] = decoded.charCodeAt(i);
          }
          const base64 = btoa(String.fromCharCode(...bytes));
          return `data:image/jpeg;base64,${base64}`;
        } catch (e) {
          console.warn('Failed to decode base64 string:', e);
          return null;
        }
      }
      
      if (image.content instanceof Uint8Array) {
        const base64 = btoa(String.fromCharCode(...image.content));
        return `data:image/jpeg;base64,${base64}`;
      }
      
      if (image.content instanceof ArrayBuffer) {
        const bytes = new Uint8Array(image.content);
        const base64 = btoa(String.fromCharCode(...bytes));
        return `data:image/jpeg;base64,${base64}`;
      }
      
      if (image.content instanceof Blob) {
        return URL.createObjectURL(image.content);
      }

      return null;
      
    } catch (error) {
      console.error('Error converting image to data URL:', error);
      return null;
    }
  }

  private isBase64String(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  onImageError(event: any) {
    console.error('Image failed to load:', event);
    event.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-success';
      case 'draft':
        return 'status-warning';
      case 'deleted':
        return 'status-danger';
      default:
        return 'status-info';
    }
  }

  submitComment() {
    if (!this.post || !this.commentForm.valid) return;

    const comment: Partial<Comment> = {
      content: this.commentForm.value.content,
      postId: this.post.id
    };

    this.commentService.addComment(this.post.id, comment.content || '', this.authService.getCurrentUserId() ?? '').subscribe({
      next: (newComment) => {
        if (this.post && this.post.comments) {
          this.post.comments.push(newComment);
        }
        this.commentForm.reset();
      },
      error: (error) => {
        console.error('Error creating comment:', error);
      }
    });
  }

  toggleLike() {
    if (!this.post || !this.isAuthenticated || !this.currentUserId) return;

    if (this.isLiked) {
      this.postService.unlikePost(this.post.id).subscribe({
        next: () => {
          if (this.post && this.post.likes) {
            const existingLike = this.post.likes.find(like => like.userId === this.currentUserId);
            if (existingLike) {
              existingLike.isLiked = false;
            }
          }
          this.isLiked = false;
        },
        error: (error) => {
          console.error('Error unliking post:', error);
        }
      });
    } else {
      this.postService.likePost(this.post.id).subscribe({
        next: (like) => {
          if (this.post && this.currentUserId) {
            if (!this.post.likes) {
              this.post.likes = [];
            }
            const existingLike = this.post.likes.find(l => l.userId === this.currentUserId);
            if (existingLike) {
              existingLike.isLiked = true;
            } else {
              this.post.likes.push({
                id: like.id || '',
                postId: this.post.id,
                userId: this.currentUserId,
                isLiked: true,
                user: this.authService.getCurrentUser() || undefined
              });
            }
          }
          this.isLiked = true;
        },
        error: (error) => {
          console.error('Error liking post:', error);
        }
      });
    }
  }

  getActiveLikesCount(): number {
    return this.post?.likes?.filter(like => like.isLiked)?.length || 0;
  }

  private checkIfLiked() {
    if (!this.post || !this.isAuthenticated || !this.currentUserId) {
      this.isLiked = false;
      return;
    }

    this.isLiked = this.post.likes?.some(like => like.userId === this.currentUserId && like.isLiked) || false;
  }
}