import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { UpdatePostDto } from '../../models/post.model';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Edit Post</h1>
        <button 
          (click)="goBack()" 
          class="text-gray-600 hover:text-gray-800"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <form *ngIf="!loading" [formGroup]="postForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Title</label>
          <input 
            type="text" 
            formControlName="title" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div *ngIf="postForm.get('title')?.touched && postForm.get('title')?.invalid" class="text-red-600 text-xs mt-1">
            Title is required
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Content</label>
          <textarea 
            formControlName="content" 
            rows="8" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
          <div *ngIf="postForm.get('content')?.touched && postForm.get('content')?.invalid" class="text-red-600 text-xs mt-1">
            Content is required
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select 
            formControlName="status"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Images</label>
          <div class="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>Upload files</span>
                  <input 
                    type="file" 
                    class="sr-only" 
                    multiple 
                    accept="image/*"
                    (change)="onFileChange($event)"
                  >
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          <!-- Image Previews -->
          <div *ngIf="selectedFiles.length > 0" class="mt-4 grid grid-cols-3 gap-4">
            <div *ngFor="let file of selectedFiles; let i = index" class="relative">
              <img [src]="previewUrls[i]" class="h-24 w-24 object-cover rounded-lg">
              <button 
                type="button" 
                (click)="removeFile(i)" 
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            type="button"
            (click)="goBack()"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button 
            type="submit"
            [disabled]="postForm.invalid || saving"
            class="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <svg *ngIf="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class PostEditComponent implements OnInit {
  postForm: FormGroup;
  loading = true;
  saving = false;
  postId: string | null = null;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      status: ['Published']
    });
  }

  ngOnInit(): void {
    this.postId = this.route.snapshot.paramMap.get('id');
    if (this.postId) {
      this.loadPost(this.postId);
    } else {
      this.router.navigate(['/posts']);
    }
  }

  loadPost(id: string): void {
    this.loading = true;
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        if (!post) {
          this.messageService.showError('Error', 'Post not found');
          this.router.navigate(['/posts']);
          return;
        }

        // Check if current user is the author
        const currentUserId = this.authService.getCurrentUserId();
        if (post.userId !== currentUserId) {
          this.messageService.showError('Error', 'You are not authorized to edit this post');
          this.router.navigate(['/posts']);
          return;
        }

        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          status: post.postStatus
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.showHttpError(error);
        this.router.navigate(['/posts']);
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          this.selectedFiles.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              this.previewUrls.push(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.postForm.valid && this.postId) {
      this.saving = true;
      
      const updateData: UpdatePostDto = {
        title: this.postForm.get('title')?.value,
        content: this.postForm.get('content')?.value,
        postStatus: this.postForm.get('postStatus')?.value,
        images: this.selectedFiles
      };

      this.postService.updatePost(this.postId, updateData).subscribe({
        next: () => {
          this.saving = false;
          this.messageService.showSuccess('Success', 'Post updated successfully');
          this.router.navigate(['/post', this.postId]);
        },
        error: (error) => {
          this.saving = false;
          this.messageService.showHttpError(error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/post', this.postId]);
  }
} 