import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'video-upload',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Upload Video</h2>
    <form (ngSubmit)="onSubmit()">
      <label>Title: <input name="title" [(ngModel)]="title" required /></label><br />
      <label>Description: <input name="description" [(ngModel)]="description" required /></label><br />
      <label>Video File: <input type="file" (change)="onFileChange($event)" required /></label><br />
      <button type="submit" [disabled]="!title || !description || !file">Upload</button>
    </form>
    <a routerLink="/">Back to List</a>
  `
})
export class VideoUploadComponent {
  title = '';
  description = '';
  file: File | null = null;
  constructor(private http: HttpClient, private router: Router) {}
  onFileChange(event: any) {
    this.file = event.target.files[0];
  }
  onSubmit() {
    if (!this.file) return;
    const formData = new FormData();
    formData.append('Title', this.title);
    formData.append('Description', this.description);
    formData.append('VideoFile', this.file);
    this.http.post('http://localhost:5008/api/Videos/upload', formData).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
} 