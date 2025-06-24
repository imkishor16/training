import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Create New Post</h1>
      <form [formGroup]="postForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" formControlName="title" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          <div *ngIf="postForm.get('title')?.touched && postForm.get('title')?.invalid" class="text-red-600 text-xs mt-1">Title is required</div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Content</label>
          <textarea formControlName="content" rows="8" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
          <div *ngIf="postForm.get('content')?.touched && postForm.get('content')?.invalid" class="text-red-600 text-xs mt-1">Content is required</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Images</label>
          <input type="file" (change)="onFileChange($event)" multiple accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          <div class="flex flex-wrap gap-4 mt-2">
            <div *ngFor="let img of imagePreviews; let i = index" class="relative w-24 h-24 border rounded overflow-hidden">
              <img [src]="img" class="object-cover w-full h-full" />
              <button type="button" (click)="removeImage(i)" class="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:text-red-800">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" (click)="cancel()" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">Cancel</button>
          <button type="submit" [disabled]="loading || postForm.invalid" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
            <svg *ngIf="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span *ngIf="!loading">Create Post</span>
            <span *ngIf="loading">Creating...</span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class PostCreateComponent {
  postForm: FormGroup;
  loading = false;
  images: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.images = Array.from(input.files);
      this.imagePreviews = [];
      for (const file of this.images) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  onSubmit(): void {
    if (this.postForm.invalid || this.loading) return;
    this.loading = true;
    const formData = new FormData();
    formData.append('title', this.postForm.value.title);
    formData.append('slug', this.postForm.value.slug);
    formData.append('content', this.postForm.value.content);
    for (const img of this.images) {
      formData.append('images', img);
    }
    this.postService.createPost(formData).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.showSuccess('Post Created', 'Your post has been created successfully!');
        this.router.navigate(['/posts']);
      },
      error: (error) => {
        this.loading = false;
        this.messageService.showHttpError(error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/posts']);
  }
} 