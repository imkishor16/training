import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Video {
  id: number;
  title: string;
  description: string;
  uploadDate: string;
  blobUrl: string;
}

@Component({
  selector: 'video-detail',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .video-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .video-player {
      width: 100%;
      aspect-ratio: 16/9;
      background: black;
      margin-bottom: 20px;
    }
    .video-info {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .video-title {
      font-size: 1.8em;
      margin: 0 0 10px 0;
      color: #333;
    }
    .video-description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 15px;
    }
    .video-meta {
      color: #888;
      font-size: 0.9em;
    }
    .back-button {
      display: inline-block;
      padding: 8px 16px;
      background: #f8f9fa;
      color: #333;
      text-decoration: none;
      border-radius: 4px;
      margin-bottom: 20px;
      border: 1px solid #ddd;
    }
    .back-button:hover {
      background: #e9ecef;
    }
  `],
  template: `
    <div class="video-container">
      <a routerLink="/" class="back-button">← Back to List</a>
      
      <div *ngIf="video" class="video-content">
        <video 
          class="video-player" 
          [src]="video?.blobUrl" 
          controls 
          autoplay
          controlsList="nodownload">
          Your browser does not support the video tag.
        </video>
        
        <div class="video-info">
          <h1 class="video-title">{{ video?.title }}</h1>
          <p class="video-meta">Uploaded: {{ video?.uploadDate | date:'medium' }}</p>
          <p class="video-description">{{ video?.description }}</p>
        </div>
      </div>

      <div *ngIf="!video" class="loading">
        Loading video...
      </div>
    </div>
  `
})
export class VideoDetailComponent implements OnInit {
  video: Video | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<Video>(`http://localhost:5008/api/Videos/${id}`).subscribe({
      next: data => this.video = data,
      error: () => this.router.navigate(['/'])
    });
  }
} 