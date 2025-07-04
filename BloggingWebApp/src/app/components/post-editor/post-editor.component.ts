import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
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
          // Use the original file name as the placeholder
          const imageName = file.name || `content-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
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

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading post...</p>
      </div>

      <!-- Editor Form -->
      <form [formGroup]="postForm" class="editor-form" *ngIf="!isPreviewMode && !isLoading">
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
      <div class="preview-container" *ngIf="isPreviewMode && !isLoading">
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
  @ViewChild('editor') editorElement!: ElementRef;
  private editor: any;

  public Editor = ClassicEditor;
  postForm: FormGroup;
  isPreviewMode = false;
  isDragging = false;
  isSaving = false;
  isLoading = false;
  coverImagePreview: string | null = null;
  isEditMode = false;
  private contentImages: ContentImage[] = [];
  private originalContentImages: ContentImage[] = []; // Track original images for edit mode
  private pendingContent: string | null = null;
  private coverImageFile: File | null = null; // Track cover image file

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
      resizeUnit: '%' as const
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
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      status: ['DRAFT', Validators.required]
    });
  }

  ngOnInit() {
    // Check if we're in edit mode by looking for post ID in route
    const postId = this.route.snapshot.paramMap.get('id');
    
    if (postId) {
      this.isEditMode = true;
      this.loadPostForEditing(postId);
    } else if (this.post) {
      // If post is passed as input (for backward compatibility)
      this.isEditMode = true;
      this.loadPostFromInput();
    }
  }

  private loadPostForEditing(postId: string) {
    this.isLoading = true;
    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        // Check if current user is the post owner
        const currentUserId = this.authService.getCurrentUserId();
        if (post.user?.id !== currentUserId) {
          // User is not the owner, redirect to post detail
          this.router.navigate(['/posts', postId]);
          return;
        }
        
        this.loadPostData(post);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading post:', error);
        // Redirect to posts list on error
        this.router.navigate(['/posts']);
      }
    });
  }

  private loadPostFromInput() {
    if (this.post) {
      this.loadPostData(this.post);
    }
  }

  private loadPostData(post: Post) {
    console.log('Loading post data:', post);
    console.log('Post images:', post.images);
    
    // Store the post for edit mode
    this.post = post;
    
    // Clear existing arrays
    this.contentImages = [];
    this.originalContentImages = [];
    
    // For editing, we process the content to replace placeholders with actual image URLs
    let processedContent = post.content;
    let foundCoverImage = false;
    
    // Handle cover image if it exists
    if (post.images && post.images.length > 0) {
      post.images.forEach((image) => {
        const imageName = image.name || '';
        console.log('Processing image in loadPostData:', { 
          name: imageName, 
          hasContent: !!image.content,
          isCoverImage: imageName === 'cover-image.jpg'
        });
        
        // Handle cover image
        if (imageName === 'cover-image.jpg' && !foundCoverImage) {
          console.log('Setting cover image:', image);
          this.coverImagePreview = this.getImageUrl(image);
          foundCoverImage = true;
        }
        
        // Handle content images - replace placeholders with actual image URLs for display
        if (imageName !== 'cover-image.jpg') {
          if (processedContent.includes(imageName)) {
            console.log('Replacing placeholder in loadPostData:', { imageName });
            
            // Replace placeholder with actual image URL for display
            processedContent = processedContent.replace(
              new RegExp(imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
              `<img src="${this.getImageUrl(image)}" alt="Post image">`
            );
            
            // Add to both arrays for tracking
            const contentImage: ContentImage = {
              file: this.createFileFromImage(image, imageName),
              imageName: imageName,
              imageUrl: this.getImageUrl(image)
            };
            
            this.contentImages.push(contentImage);
            this.originalContentImages.push(contentImage);
          }
        }
      });
    }
    
    console.log('Loading content for editing:', {
      contentLength: processedContent.length,
      hasCoverImage: foundCoverImage,
      contentImagesCount: this.contentImages.length,
      originalContent: post.content,
      processedContent: processedContent.substring(0, 200) + '...'
    });
    
    // Load the processed content with actual image URLs for display
    this.postForm.patchValue({
      title: post.title,
      content: processedContent,
      status: post.postStatus
    });
    
    // Manually set editor content if editor is ready
    if (this.editor) {
      console.log('Manually setting editor content:', processedContent.substring(0, 100) + '...');
      this.editor.setData(processedContent);
    } else {
      console.log('Editor not ready yet, will set content when ready');
      // Set a flag to update content when editor is ready
      this.pendingContent = processedContent;
    }
  }

  onEditorReady(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return new UploadAdapter(loader, this);
    };

    // Store editor reference for manual content setting
    this.editor = editor;

    // Set pending content if any
    if (this.pendingContent) {
      console.log('Setting pending content in editor:', this.pendingContent.substring(0, 100) + '...');
      editor.setData(this.pendingContent);
      this.pendingContent = null;
    }

    // Listen to content changes to track removed images
    editor.model.document.on('change:data', () => {
      const content = editor.getData();
      console.log('Editor content changed:', content);
      
      // Clean up removed images from contentImages array
      this.contentImages = this.contentImages.filter(imageInfo => {
        const isImageStillInContent = content.includes(imageInfo.imageUrl);
        if (!isImageStillInContent) {
          console.log('Image removed from content:', imageInfo.imageName);
        }
        return isImageStillInContent;
      });
    });
  }

  private createFileFromImage(image: any, imageName: string): CustomFile {
    // Create a File object from the image data for tracking purposes
    try {
      if (image.content instanceof Blob) {
        return new File([image.content], imageName, { type: image.content.type });
      } else if (typeof image.content === 'string') {
        // Convert base64 to blob
        const byteCharacters = atob(image.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        return new File([blob], imageName, { type: 'image/jpeg' });
      }
    } catch (error) {
      console.error('Error creating file from image:', error);
    }
    
    // Fallback to empty file
    return new File([], imageName, { type: 'image/jpeg' });
  }

  get sanitizedContent(): SafeHtml {
    // Content already contains actual image URLs, no need to process
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

    // Store the original file
    this.coverImageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.coverImagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeCoverImage() {
    console.log('Removing cover image');
    this.coverImagePreview = null;
    this.coverImageFile = null;
  }

  togglePreview() {
    this.isPreviewMode = !this.isPreviewMode;
  }

  private base64ToFile(base64String: string, filename: string): File {
    try {
      // Check if the string is a data URL
      if (base64String.startsWith('data:')) {
        // Extract the actual base64 part and mime type
        const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error('Invalid data URL format');
        }
        const mimeType = matches[1];
        const base64Data = matches[2];
        
        try {
          // Try to decode the base64 data
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return new File([bytes], filename, { type: mimeType });
        } catch (e) {
          console.error('Error decoding base64 data:', e);
          throw new Error('Invalid base64 data');
        }
      } else {
        // If it's not a data URL, try to handle it as raw base64
        try {
          // Add padding if necessary
          const base64Data = base64String.replace(/^data:/, '').replace(/[^A-Za-z0-9+/]/g, '');
          const paddedBase64 = base64Data + '==='.slice((base64Data.length + 3) % 4);
          
          const binaryString = atob(paddedBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return new File([bytes], filename, { type: 'image/jpeg' });
        } catch (e) {
          console.error('Error handling raw base64:', e);
          throw new Error('Invalid base64 string'); 
        }
      }
    } catch (error) {
      console.error('Error in base64ToFile:', error);
      // Return a placeholder image file if conversion fails
      return new File([new Uint8Array(0)], filename, { type: 'image/jpeg' });
    }
  }

  savePost() {
    if (this.postForm.invalid) return;

    this.isSaving = true;
    const formData = new FormData();
    
    // Get the current content and convert image URLs to placeholders
    let content = this.postForm.get('content')?.value || '';
    
    // Clean up the content
    content = content
      // Remove any remaining ">" characters after image tags
      .replace(/<img[^>]*>\s*"+\s*/g, '<img$&>')
      // Clean up any double spaces
      .replace(/\s{2,}/g, ' ')
      // Clean up empty paragraphs
      .replace(/<p>\s*<\/p>/g, '')
      .trim();

    console.log('Starting savePost with content:', content);
    const images: File[] = [];

    // Add cover image as the first image ONLY if it was explicitly added via cover image upload
    if (this.coverImagePreview && this.coverImageFile) {
      try {
        console.log('Processing cover image:', this.coverImageFile.name);
        // Create a new file with the correct name "cover-image.jpg"
        const coverImageFile = new File([this.coverImageFile], 'cover-image.jpg', { 
          type: this.coverImageFile.type 
        });
        console.log('Cover image file created:', coverImageFile);
        if (coverImageFile.size > 0) {
          images.push(coverImageFile);
          console.log('Added cover image to images array');
        }
      } catch (error) {
        console.error('Error processing cover image:', error);
      }
    }

    // Convert image URLs to placeholders and collect images
    this.contentImages.forEach((imageInfo) => {
      try {
        console.log('Processing content image:', { imageName: imageInfo.imageName });
        
        // Replace image URL with placeholder in content
        // Handle both <img> tags and <figure><img> structures
        const imgTagRegex = new RegExp(`<img[^>]*src="${imageInfo.imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g');
        const figureImgRegex = new RegExp(`<figure[^>]*>\\s*<img[^>]*src="${imageInfo.imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>\\s*</figure>`, 'g');
        
        // First try to replace <figure><img> structure
        if (content.match(figureImgRegex)) {
          content = content.replace(figureImgRegex, imageInfo.imageName);
        } else {
          // Then try to replace just <img> tag
          content = content.replace(imgTagRegex, imageInfo.imageName);
        }
        
        if (imageInfo.file instanceof File) {
          // Keep the original file name
          images.push(imageInfo.file);
          console.log('Added content image to images array:', imageInfo.imageName);
        }
      } catch (error) {
        console.error('Error processing content image:', error);
      }
    });

    console.log('Final content with placeholders:', content);
    console.log('Total images to upload:', images.length);

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
      if (image instanceof File && image.size > 0) {
        console.log('Appending image to FormData:', { name: image.name, size: image.size });
        formData.append('Images', image);
      }
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
    console.log('Post saved successfully:', response);
    console.log('Images in response:', response.images);

    // Replace image placeholders with actual images from response
    if (response.images && response.images.length > 0) {
      let content = response.content;
      response.images.forEach((image, index) => {
        const imageName = image.name || `content-image-${index}.jpg`;
        console.log('Processing response image:', { name: imageName, hasContent: !!image.content });
        
        if (imageName === 'cover-image.jpg') {
          console.log('Skipping cover image in content replacement');
          return;
        }

        if (image.content) {
          console.log('Replacing placeholder:', imageName);
          content = content.replace(
            imageName, 
            `<img src="${this.getImageUrl(image)}" alt="Post image ${index + 1}">`
          );
        }
      });
      response.content = content;
    }

    this.isSaving = false;
    // Navigate to the post detail page
    this.router.navigate(['/posts', response.id]);
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

  // Public method to add content image
  addContentImage(image: ContentImage) {
    console.log('Adding content image:', image.imageName);
    this.contentImages.push(image);
  }
} 