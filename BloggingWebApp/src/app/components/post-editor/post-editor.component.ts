import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CreatePostDto, Post, UpdatePostDto, CustomFile } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AuthService } from '../../services/auth.service';

// Custom upload adapter
class UploadAdapter {
  constructor(private loader: any, private component: PostEditorComponent) {}

  upload(): Promise<{ default: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      this.loader.file.then((file: CustomFile) => {
        reader.onload = () => {
          const imageUrl = reader.result as string;
          // Generate a unique name for this image
          const imageName = `image_${Date.now()}_${this.component.getNextImageCounter()}`;
          // Store the image info
          this.component.addContentImage({
            file,
            imageName,
            imageUrl
          });
          // Return the actual image URL for display in editor
          resolve({ default: imageUrl });
        };
        reader.onerror = () => reject('Upload failed');
        reader.readAsDataURL(file);
      });
    });
  }

  abort(): void {}
}

interface ContentImage {
  file: CustomFile;
  imageName: string;
  imageUrl: string;
}

interface PostPreview {
  title: string;
  content: string;
  coverImage?: File | string;
  status: 'PUBLISHED' | 'DRAFT';
}

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  template: `
    <div class="editor-container">
      <!-- Header with actions -->
      <div class="editor-header">
        <h1 class="editor-title">{{ isEditMode ? 'Edit Post' : 'Create New Post' }}</h1>
        <div class="action-buttons">
          <button 
            class="preview-button"
            (click)="togglePreview()"
            [class.active]="isPreviewMode"
          >
            {{ isPreviewMode ? 'Edit' : 'Preview' }}
          </button>
          <button 
            class="save-button"
            (click)="savePost()"
            [disabled]="postForm.invalid || isSaving"
          >
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- Editor Form -->
      <form [formGroup]="postForm" class="editor-form" *ngIf="!isPreviewMode">
        <!-- Title Input -->
        <div class="form-group">
          <label for="title" class="form-label">Title</label>
          <input 
            type="text" 
            id="title"
            class="form-input"
            formControlName="title"
            placeholder="Enter post title"
            [class.error]="postForm.get('title')?.invalid && postForm.get('title')?.touched"
          >
          <div 
            class="error-message" 
            *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched"
          >
            Title is required
          </div>
        </div>

        <!-- Cover Image Upload -->
        <div class="form-group">
          <label class="form-label">Cover Image</label>
          <div 
            class="cover-image-upload"
            (dragover)="onDragOver($event)"
            (drop)="onDrop($event)"
            [class.drag-over]="isDragging"
          >
            <div *ngIf="!coverImagePreview" class="upload-placeholder">
              <i class="upload-icon">📁</i>
              <span>Drag and drop your cover image or</span>
              <label class="upload-button">
                Browse
                <input 
                  type="file" 
                  (change)="onCoverImageSelected($event)"
                  accept="image/*"
                  hidden
                >
              </label>
            </div>
            <div *ngIf="coverImagePreview" class="image-preview">
              <img [src]="coverImagePreview" alt="Cover image preview">
              <button 
                type="button"
                class="remove-image"
                (click)="removeCoverImage()"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Rich Text Editor -->
        <div class="form-group">
          <label class="form-label">Content</label>
          <ckeditor
            [editor]="Editor"
            formControlName="content"
            [config]="editorConfig"
            (ready)="onEditorReady($event)"
            [class.error]="postForm.get('content')?.invalid && postForm.get('content')?.touched"
          ></ckeditor>
          <div 
            class="error-message" 
            *ngIf="postForm.get('content')?.invalid && postForm.get('content')?.touched"
          >
            Content is required
          </div>
        </div>

        <!-- Post Status -->
        <div class="form-group">
          <label for="status" class="form-label">Status</label>
          <select 
            id="status"
            class="form-select"
            formControlName="status"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </form>

      <!-- Preview Mode -->
      <div class="preview-container" *ngIf="isPreviewMode">
        <div class="preview-content">
          <h1 class="preview-title">{{ postForm.get('title')?.value }}</h1>
          
          <div class="preview-cover-image" *ngIf="coverImagePreview">
            <img [src]="coverImagePreview" [alt]="postForm.get('title')?.value">
          </div>
          
          <div 
            class="preview-body"
            [innerHTML]="sanitizedContent"
          ></div>

          <div class="preview-status">
            Status: 
            <span [class]="'status-' + postForm.get('status')?.value.toLowerCase()">
              {{ postForm.get('status')?.value }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./post-editor.component.css']
})
export class PostEditorComponent implements OnInit {
  @Input() post?: Post;
  @ViewChild('editor') editor!: ElementRef;

  public Editor = ClassicEditor;
  postForm: FormGroup;
  isPreviewMode = false;
  isDragging = false;
  isSaving = false;
  coverImagePreview: string | null = null;
  isEditMode = false;
  private imageCounter = 0;
  private contentImages: ContentImage[] = [];

  editorConfig = {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'outdent',
        'indent',
        '|',
        'imageUpload',
        'blockQuote',
        'insertTable',
        'undo',
        'redo'
      ]
    },
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'resizeImage:50',
        'resizeImage:75',
        'resizeImage:100',
        'resizeImage:original'
      ],
      resizeOptions: [
        {
          name: 'resizeImage:original',
          value: null,
          label: 'Original'
        },
        {
          name: 'resizeImage:100',
          value: '100',
          label: '100%'
        },
        {
          name: 'resizeImage:75',
          value: '75',
          label: '75%'
        },
        {
          name: 'resizeImage:50',
          value: '50',
          label: '50%'
        }
      ],
      resizeUnit: '%'
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells'
      ]
    },
    language: 'en'
  };

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      status: ['DRAFT', Validators.required]
    });
  }

  ngOnInit() {
    if (this.post) {
      this.isEditMode = true;
      this.postForm.patchValue({
        title: this.post.title,
        content: this.post.content,
        status: this.post.postStatus
      });

      if (this.post.images?.[0]) {
        this.coverImagePreview = this.post.images[0].content as unknown as string;
      }
    }
  }

  onEditorReady(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return new UploadAdapter(loader, this);
    };
  }

  get sanitizedContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.postForm.get('content')?.value || '');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleCoverImage(files[0]);
    }
  }

  onCoverImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.handleCoverImage(file);
    }
  }

  handleCoverImage(file: File) {
    if (!file.type.startsWith('image/')) {
      console.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.coverImagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeCoverImage() {
    this.coverImagePreview = null;
  }

  togglePreview() {
    this.isPreviewMode = !this.isPreviewMode;
  }

  savePost() {
    if (this.postForm.invalid) return;

    this.isSaving = true;
    const formData = new FormData();
    
    // Get the current content and replace image URLs with placeholders
    let content = this.postForm.get('content')?.value || '';
    const images: File[] = [];

    // Add cover image as the first image if it exists
    if (this.coverImagePreview) {
      const coverImageFile = this.base64ToFile(this.coverImagePreview, 'cover_image.jpg');
      images.push(coverImageFile);
    }

    // Replace image URLs with placeholders and collect images in order
    this.contentImages.forEach(imageInfo => {
      content = content.replace(
        imageInfo.imageUrl,
        `[IMAGE_PLACEHOLDER:${imageInfo.imageName}]`
      );
      images.push(imageInfo.file);
    });

    // Add form fields with null checks
    const title = this.postForm.get('title')?.value || '';
    const postStatus = this.postForm.get('status')?.value || 'DRAFT';
    const userId = this.authService.getCurrentUserId() || '';

    formData.append('title', title);
    formData.append('content', content);
    formData.append('postStatus', postStatus);
    formData.append('userId', userId);

    // Add each image to FormData with array notation
    images.forEach((image, index) => {
      formData.append(`Images`, image); // Changed to match C# model property name
    });

    try {
      if (this.isEditMode && this.post) {
        this.postService.updatePost(this.post.id, formData).subscribe({
          next: (response) => {
            this.handlePostSuccess(response);
          },
          error: (error) => {
            console.error('Error updating post:', error);
            this.isSaving = false;
          }
        });
      } else {
        this.postService.createPost(formData).subscribe({
          next: (response) => {
            this.handlePostSuccess(response);
          },
          error: (error) => {
            console.error('Error creating post:', error);
            this.isSaving = false;
          }
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      this.isSaving = false;
    }
  }

  private handlePostSuccess(response: Post) {
    // Replace image placeholders with actual images from response
    if (response.images && response.images.length > 0) {
      let content = response.content;
      response.images.forEach((image, index) => {
        if (index === 0 && this.coverImagePreview) {
          // Skip cover image
          return;
        }
        // Find placeholder for this image and replace it
        const placeholder = content.match(/\[IMAGE_PLACEHOLDER:image_[0-9_]+\]/)?.[0];
        if (placeholder && image.content) {
          content = content.replace(
            placeholder, 
            `<img src="${this.getImageUrl(image)}" alt="Post image ${index + 1}">`
          );
        }
      });
      response.content = content;
    }
    this.isSaving = false;
    // Handle success (e.g., navigate to post detail)
  }

  private base64ToFile(base64String: string, filename: string): File {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  private getImageUrl(image: any): string {
    if (image.content instanceof Blob) {
      return URL.createObjectURL(image.content);
    } else if (typeof image.content === 'string') {
      if (image.content.startsWith('data:image')) {
        return image.content;
      }
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
    return '';
  }

  // Public method to get next image counter
  getNextImageCounter(): number {
    return this.imageCounter++;
  }

  // Public method to add content image
  addContentImage(image: ContentImage) {
    this.contentImages.push(image);
  }
} 