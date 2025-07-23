import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl, SafeHtml } from '@angular/platform-browser';
import { Post, Comment } from '../../models/post.model';
import { CreateReportDto, Report} from '../../models/report.model';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';
import { ReportService } from '../../services/report.service';

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
          <div class="author-avatar">{{ getUserDisplayName()?.charAt(0) || 'U' }}</div>
          <div class="author-info">
            <span class="author-name">{{ getUserDisplayName() }}</span>
            <span class="post-status" [class]="getStatusClass(post.postStatus)">
              {{ post.postStatus }}
            </span>
          </div>
        </div>

        <!-- Post Title -->
        <h1 class="post-title">{{ post.title }}</h1>

        <!-- Cover Image -->
        <div class="cover-image" *ngIf="getCoverImage()">
          <img
            [src]="getImageUrl(getCoverImage()!)"
            [alt]="post.title"
            class="post-cover-image"
            (error)="onImageError($event)"
          />
        </div>

        <!-- Post Content -->
        <div class="post-text" [innerHTML]="getProcessedContent()"></div>

        <!-- Post Actions -->
        <div class="post-actions">
          <div class="action-buttons">
            <button
              class="like-button"
              (click)="toggleLike()"
              [class.liked]="isLiked"
              [disabled]="!isAuthenticated"
            >
              <span class="like-icon">♥</span>
              <span class="like-count">{{ getActiveLikesCount() }} Likes</span>
            </button>
            <!-- Report Button -->
             <button
              *ngIf="!isPostOwner"
              class="report-button"
              (click)="toggleReportForm()"
              [disabled]="!isAuthenticated || isReported"
            >
              <span class="report-icon">🚩</span>
              <span class="report-text">
                {{ isReported ? 'Reported' : 'Report' }}
              </span>
            </button>
            <!-- Edit Button - Only show for post owner -->
            <button
              *ngIf="isPostOwner"
              class="edit-button"
              (click)="editPost()"
            >
              <span class="edit-icon">✏️</span>
              <span>Edit Post</span>
            </button>
          </div>
        </div>

        <div *ngIf="isAuthenticated && !isReported && showReportForm" class="report-backdrop">
          <div class="report-form-container">
          <form [formGroup]="reportForm" (ngSubmit)="submitReport()">
            <div class="form-group">
              <!-- Reason Dropdown -->
              <select
                class="report-select"
                formControlName="category"
                [class.error]="reportForm.get('category')?.invalid && reportForm.get('category')?.touched"
              >
                <option value="" disabled selected>Select report reason</option>
                <option value="InappropriateContent">Inappropriate Content</option>
                <option value="Harassment">Harassment</option>
                <option value="Spam">Spam</option>
                <option value="FakeNews">Fake News</option>
                <option value="HateSpeech">Hate Speech</option>
                <option value="Technical">Technical</option>
                <option value="Other">Other</option>
              </select>
              <div class="error-message" *ngIf="reportForm.get('category')?.invalid && reportForm.get('category')?.touched">
                Please select a reason
              </div>

              <!-- Comment Input -->
              <textarea
                class="report-comment"
                formControlName="content"
                placeholder="Write your report comment..."
                rows="3"
                [class.error]="reportForm.get('content')?.invalid && reportForm.get('content')?.touched"
              ></textarea>
              <div class="error-message" *ngIf="reportForm.get('content')?.invalid && reportForm.get('content')?.touched">
                Please enter a comment
              </div>

              <div class="input-group">
                <!-- Submit Button -->
                <button
                  type="submit"
                  class="submit-button"
                  [disabled]="!reportForm.valid || reportForm.pristine"
                >
                  Submit Report
                </button>
                <button class="submit-button" (click)="toggleReportForm()">Close</button>
              </div>
            </div>
          </form>
          </div>
        </div>

        <hr class="divider">

        <!-- Comments Section -->
        <div class="comments-section">
          <h2 class="comments-title">Comments ({{ post.comments?.length || 0 }})</h2>

          <!-- Comment Form -->
          <div *ngIf="isAuthenticated" class="comment-form-container">
            <div class="current-user">
              <div class="user-avatar">
                {{ getCurrentUserDisplayName()?.charAt(0) || 'U' }}
              </div>
              <span class="user-name">{{ getCurrentUserDisplayName() }}</span>
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
                  {{ getCommentAuthorName(comment)?.charAt(0) || 'U' }}
                </div>
                <div class="comment-meta">
                  <span class="comment-author">{{ getCommentAuthorName(comment) }}</span>
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
  isPostOwner = false;
  private currentUserId: string | null = null;
  currentUser: User | null = null;

  reportForm: FormGroup;
  showReportForm = false;
  isReported = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private commentService: CommentService,
    private reportService: ReportService,
    public authService: AuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]]
    });
    this.reportForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]],
      category: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUserId = this.authService.getCurrentUserId();
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(postId);
    }
  }

  loadPost(postId: string) {
    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        console.log('Loaded post:', post);
        console.log('Post images:', post.images);
        this.post = post;
        this.checkIfLiked();
        this.checkIfPostOwner();
        this.checkIfReported();
      },
      error: (error) => {
        console.error('Error loading post:', error);
      }
    });
  }

  editPost() {
    if (this.post) {
      this.router.navigate(['/posts', this.post.id, 'edit']);
    }
  }

  private checkIfPostOwner() {
    if (!this.post || !this.currentUserId) {
      this.isPostOwner = false;
      return;
    }

    // Check if current user is the post owner
    this.isPostOwner = this.post.user?.id === this.currentUserId;
  }

  getCoverImage(): { content: any, name?: string } | null {
    if (!this.post?.images || this.post.images.length === 0) {
      return null;
    }
    return this.post.images.find(img => img.name === 'cover-image.jpg') || null;
  }

  getImageUrl(image: { content: any, name?: string }): string {
    console.log('Getting URL for image:', { name: image.name, type: typeof image.content });
    const dataUrl = this.convertImageToDataUrl(image);
    if (!dataUrl) {
      console.warn('Failed to convert image to data URL:', image);
    }
    return dataUrl || 'https://via.placeholder.com/800x400?text=No+Image';
  }

  getProcessedContent(): SafeHtml {
    if (!this.post?.content) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    console.log('Processing content:', this.post.content);
    console.log('Available images:', this.post.images);

    let processedContent = this.post.content;
    const contentImages = (this.post.images || []).filter(img => img.name !== 'cover-image.jpg');

    // Clean up CKEditor's output
    processedContent = processedContent
      // Remove figure tags with malformed image URLs
      .replace(/<figure[^>]*>.*?<img[^>]*src="<img[^>]*>"[^>]*>.*?<\/figure>/g, '')
      // Remove any remaining width/height attributes
      .replace(/\s(width|height)=["']\d+["']/g, '')
      // Remove style attributes containing aspect-ratio
      .replace(/\sstyle="[^"]*aspect-ratio[^"]*"/g, '')
      // Clean up any empty style attributes
      .replace(/\sstyle=""/g, '')
      // Clean up any double spaces
      .replace(/\s{2,}/g, ' ');

    // Replace image placeholders with actual images
    // Look for [IMAGE:filename] pattern in content
    const imagePlaceholderRegex = /\[IMAGE:([^\]]+)\]/g;
    let match;
    let processedImages = new Set<string>(); // Track processed images to avoid duplicates

    while ((match = imagePlaceholderRegex.exec(processedContent)) !== null) {
      const fullPlaceholder = match[0]; // [IMAGE:filename]
      const imageName = match[1]; // filename

      console.log('Found image placeholder:', { fullPlaceholder, imageName });

      // Find the corresponding image in the images array
      const image = contentImages.find(img => img.name === imageName);

      if (image && image.content && !processedImages.has(imageName)) {
        console.log('Replacing placeholder with image:', { imageName, hasContent: !!image.content });

        const imageUrl = this.getImageUrl(image);
        const imageHtml = `<figure class="image">
          <img src="${imageUrl}"
               style="max-width: 100%; height: auto; display: block; margin: 1rem 0; border-radius: 8px;"
               class="content-image"
               alt="Post content image"
               loading="lazy">
        </figure>`;

        // Replace the placeholder with the image HTML
        processedContent = processedContent.replace(fullPlaceholder, imageHtml);
        processedImages.add(imageName);
      } else {
        console.warn('Image not found for placeholder:', imageName);
        // Replace with a placeholder image or remove the placeholder
        processedContent = processedContent.replace(fullPlaceholder,
          '<div style="padding: 2rem; text-align: center; background: #f5f5f5; border-radius: 8px; color: #666;">Image not available</div>'
        );
      }
    }

    console.log('Final processed content:', processedContent);
    return this.sanitizer.bypassSecurityTrustHtml(processedContent);
  }


  private convertImageToDataUrl(image: { content: any }): string | null {
    try {
      if (!image || !image.content) {
        console.warn('No image content provided');
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

      console.warn('Unsupported image content type:', typeof image.content);
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

  // Report part
  submitReport(){
    if (!this.post || !this.reportForm.valid) return;

    const report: Partial<CreateReportDto> = {
      content: this.reportForm.value.content,
      category: this.reportForm.value.category,
      userId: this.authService.getCurrentUserId() ?? '',
      postId: this.post.id
    };

    this.reportService.addReport(report).subscribe({
      next: (res) => {
        this.reportForm.reset();
        this.toggleReportForm();
        this.checkIfReported();
      },
      error: (error) => {
        console.error('Error creating report:', error);
      }
    });
  }

  toggleReportForm() {
    this.showReportForm = !this.showReportForm;
    // if (this.showReportForm) {
    //   this.reportForm.reset();
    // }
  }

  checkIfReported(){
    if (!this.post || !this.isAuthenticated || !this.currentUserId) {
      this.isLiked = false;
      return;
    }

    this.reportService.reportStatus(this.post.id).subscribe({
      next:(res:any)=>{
        if(res.isExists){
          this.isReported = true;
        }
        else{
          this.isReported = false;
        }
      },
      error:(err)=>{
        console.error('Error status report:', err);
      }
    })
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
                user: this.currentUser || undefined
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

  getUserDisplayName(): string | undefined {
    return this.post?.user?.name || this.post?.user?.username;
  }

  getCommentAuthorName(comment: Comment): string | undefined {
    return comment.user?.name || comment.user?.username;
  }

  getCurrentUserDisplayName(): string | undefined {
    return this.currentUser?.name || this.currentUser?.username;
  }
}
