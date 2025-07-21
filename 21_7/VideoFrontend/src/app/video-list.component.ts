import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Video {
  id: number;
  title: string;
  description: string;
  uploadDate: string;
  blobUrl: string;
}

@Component({
  selector: 'video-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .video-list-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin: 0 20px 10px 20px;
    }
    .upload-button {
      padding: 10px 24px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.3s;
      font-size: 1rem;
    }
    .upload-button:hover {
      background: #0056b3;
      transform: translateY(-2px);
    }
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    .video-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s;
      cursor: pointer;
      background: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .video-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .video-thumbnail {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
    .video-info {
      padding: 15px;
    }
    .video-title {
      font-size: 1.2em;
      margin: 0 0 10px 0;
      color: #333;
    }
    .video-description {
      color: #666;
      font-size: 0.9em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #333;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .modal-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    .modal-buttons button {
      padding: 8px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    .cancel-button {
      background: #f8f9fa;
      border: 1px solid #ddd;
    }
    .submit-button {
      background: #007bff;
      color: white;
      border: none;
    }
    .submit-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `],
  template: `
    <div class="video-list-header">
      <button class="upload-button" (click)="showUploadModal = true">
        Upload Video
      </button>
    </div>
    <div class="video-grid">
      <div *ngFor="let video of videos" class="video-card" (click)="viewDetail(video.id)">
        <video class="video-thumbnail" [src]="video.blobUrl" preload="metadata">
          Your browser does not support the video tag.
        </video>
        <div class="video-info">
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-description">{{ video.description }}</p>
          <small>{{ video.uploadDate | date }}</small>
        </div>
      </div>
    </div>

    <div class="modal" *ngIf="showUploadModal">
      <div class="modal-content">
        <h2>Upload New Video</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Title</label>
            <input id="title" type="text" [(ngModel)]="newVideo.title" name="title" required>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" [(ngModel)]="newVideo.description" name="description" required></textarea>
          </div>
          <div class="form-group">
            <label for="file">Video File</label>
            <input id="file" type="file" (change)="onFileChange($event)" accept="video/*" required>
          </div>
          <div class="modal-buttons">
            <button type="button" class="cancel-button" (click)="showUploadModal = false">Cancel</button>
            <button type="submit" class="submit-button" [disabled]="!isFormValid()">Upload</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VideoListComponent implements OnInit {
  videos: Video[] = [];
  showUploadModal = false;
  newVideo = {
    title: '',
    description: '',
    file: null as File | null
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos() {
    this.http.get<Video[]>('http://localhost:5008/api/Videos').subscribe(data => this.videos = data);
  }

  viewDetail(id: number) {
    this.router.navigate(['/videos', id]);
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.newVideo.file = files[0];
    }
  }

  isFormValid(): boolean {
    return !!(this.newVideo.title && this.newVideo.description && this.newVideo.file);
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    const formData = new FormData();
    formData.append('Title', this.newVideo.title);
    formData.append('Description', this.newVideo.description);
    formData.append('VideoFile', this.newVideo.file!);

    this.http.post('http://localhost:5008/api/Videos/upload', formData).subscribe({
      next: () => {
        this.showUploadModal = false;
        this.newVideo = { title: '', description: '', file: null };
        this.loadVideos();
      },
      error: (error) => {
        console.error('Upload failed:', error);
        // You might want to show an error message to the user here
      }
    });
  }
} 