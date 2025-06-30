import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeUrl, SafeHtml } from '@angular/platform-browser';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

interface PostImage {
  content: Blob | Uint8Array | string;
  name?: string;
  type?: string;
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <article class="post-card" (click)="navigateToPost()">
      <div [class]="'post-card-image ' + (hasValidImage ? '' : 'no-image')">
        <img 
          *ngIf="hasValidImage"
          [src]="getPostImage()"
          [alt]="post.title"
        />
      </div>

      <div class="post-card-content">
        <div class="post-card-author">
          <div class="author-avatar">
            {{ post.user?.username?.charAt(0) || 'U' }}
          </div>
          <div class="author-info">
            <span class="author-name">{{ post.user?.username || 'Anonymous' }}</span>
            <span class="post-status" [class]="getStatusClass(post.postStatus)">
              {{ post.postStatus }}
            </span>
          </div>
        </div>

        <h2 class="post-card-title">{{ post.title }}</h2>
        
        <div class="post-card-excerpt" [innerHTML]="getProcessedContent()"></div>

        <div class="post-card-footer">
          <div class="post-stats">
            <button 
              class="like-button"
              (click)="toggleLike($event)"
              [class.liked]="isLiked"
              [disabled]="!isAuthenticated"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [style.fill]="isLiked ? 'currentColor' : 'none'">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {{ getActiveLikesCount() }}
            </button>
            <span class="stat-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {{ post.comments?.length || 0 }}
            </span>
          </div>
        </div>
      </div>
    </article>
  `,
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent {
  @Input() post!: Post;
  isLiked = false;
  isAuthenticated = false;
  hasValidImage = false;
  private currentUserId: string | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUserId = this.authService.getCurrentUserId();
    this.checkIfLiked();
    this.checkIfHasValidImage();
  }

  ngOnChanges() {
    this.checkIfLiked();
  }

  checkIfHasValidImage(): void {
    if (this.post.images && this.post.images.length > 0) {
      const image = this.post.images[0] as PostImage;
      this.hasValidImage = !!image.content;
    } else {
      this.hasValidImage = false;
    }
  }

  getPostImage(): SafeUrl | string {
    if (this.post.images && this.post.images.length > 0) {
      const image = this.post.images[0] as PostImage;
      
      if (image.content instanceof Blob) {
        return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(image.content));
      } else if (image.content instanceof Uint8Array) {
        const blob = new Blob([image.content], { type: 'image/jpeg' });
        return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
      } else if (typeof image.content === 'string') {
        if (image.content.startsWith('data:image')) {
          return this.sanitizer.bypassSecurityTrustUrl(image.content);
        } else {
          try {
            const byteString = atob(image.content);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            
            for (let i = 0; i < byteString.length; i++) {
              uint8Array[i] = byteString.charCodeAt(i);
            }
            
            const blob = new Blob([uint8Array], { type: 'image/jpeg' });
            return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
          } catch (e) {
            console.error('Error converting image:', e);
            return '';
          }
        }
      }
    }
    return '';
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

  toggleLike(event: Event) {
    event.stopPropagation();
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

  navigateToPost() {
    this.router.navigate(['/posts', this.post.id]);
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

  getProcessedContent(): SafeHtml {
    if (!this.post.content) return this.sanitizer.bypassSecurityTrustHtml('');

    let processedContent = this.post.content;
    
    // Replace image placeholders with actual images
    if (this.post.images) {
      // Create a map of images excluding the cover image
      const contentImages = this.post.images.slice(1); // Skip cover image
      let currentImageIndex = 0;
      
      // Replace all placeholders with actual images
      processedContent = processedContent.replace(
        /\[IMAGE_PLACEHOLDER:image_[0-9_]+\]/g,
        (match) => {
          if (currentImageIndex < contentImages.length) {
            const image = contentImages[currentImageIndex];
            const imageUrl = this.getImageUrl(image);
            currentImageIndex++;
            return `<img src="${imageUrl}" alt="Post image ${currentImageIndex}" class="content-image">`;
          }
          return ''; // If no more images, remove the placeholder
        }
      );
    }

    // Create a preview by truncating the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedContent;
    let textContent = tempDiv.textContent || tempDiv.innerText;
    textContent = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '');

    return this.sanitizer.bypassSecurityTrustHtml(textContent);
  }

  private getImageUrl(image: PostImage): string {
    if (image.content instanceof Blob) {
      return URL.createObjectURL(image.content);
    } else if (image.content instanceof Uint8Array) {
      const blob = new Blob([image.content], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } else if (typeof image.content === 'string') {
      if (image.content.startsWith('data:image')) {
        return image.content;
      } else {
        try {
          const byteString = atob(image.content);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          
          const blob = new Blob([uint8Array], { type: 'image/jpeg' });
          return URL.createObjectURL(blob);
        } catch (e) {
          console.error('Error converting image:', e);
          return '';
        }
      }
    }
    return '';
  } 
} 