import {Component,OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DomSanitizer,SafeHtml} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {ReportService} from '../../services/report.service';
import {Report} from '../../models/report.model';
import {FormControl,ReactiveFormsModule} from '@angular/forms';
import {debounceTime,distinctUntilChanged} from 'rxjs/operators';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-reported-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `<div class="container" *ngIf="!isLoading; else loading">
  <div class="toolbar-header">
    <div class="post-info">
      <h1 class="post-title">{{ postTitle.length > 25 ? (postTitle | slice:0:27) + ' ...' : postTitle }}</h1>
      <span class="author-badge">{{ postAuthor || 'Unknown' }}</span>
    </div>

    <div class="toolbar-actions">
      <select [formControl]="categoryControl" class="category-filter">
        <option *ngFor="let cat of categories" [value]="cat.value">{{ cat.label }}</option>
      </select>

      <button class="view-btn" (click)="viewPostDetails()">View Post</button>
      <button class="delete-btn" (click)="deletePost()">Delete Post</button>
    </div>
  </div>

  <div class="report-section">
    <h2 class="report-section-title">Reports ({{ reports.length }})</h2>

    <div *ngIf="reports.length; else noReports">
      <div class="report-card" *ngFor="let report of reports">
        <div class="report-header">
          <div class="category-badge">{{ report.category }}</div>
        </div>

        <div class="report-content">
          Reason : {{ report.content }}
        </div>

        <div class="report-meta">
          <span>Reporter: {{ report.user?.username || 'Unknown' }}</span>
          <span>{{ report.createdAt | date: 'medium' }}</span>
        </div>
      </div>
    </div>

    <ng-template #noReports>
      <p>No reports available.</p>
    </ng-template>
  </div>
</div>

<ng-template #loading>
  <div class="loading">Loading reports...</div>
</ng-template>
`,
  styleUrls: ['./reported-post-detail.component.css']
})
export class ReportedPostComponent implements OnInit {
  postId: string = '';
  reports: Report[] = [];
  isLoading = false;

  categoryControl = new FormControl('');
  categories = [
    { value: '', label: 'All Categories' },
    { value: 'InappropriateContent', label: 'Inappropriate Content' },
    { value: 'Harassment', label: 'Harassment' },
    { value: 'Spam', label: 'Spam' },
    { value: 'FakeNews', label: 'Fake News' },
    { value: 'HateSpeech', label: 'Hate Speech' },
    { value: 'Technical', label: 'Technical' },
    { value: 'Other', label: 'Other' }
  ];
  postTitle: string = '';
  postAuthor: string = '';

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private postService: PostService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.postId = postId;
      this.loadReports('');

      this.categoryControl.valueChanges
        .pipe(
          debounceTime(400),
          distinctUntilChanged()
        )
        .subscribe((category) => {
          this.loadReports(category || '');
        });
    }
  }

  loadReports(category: string) {
    this.isLoading = true;
    this.reportService.getFilteredReports(this.postId, category).subscribe({
      next: (res:any) => {
        console.log(res[0]);
        this.postTitle = res[0].post.title;
        this.postAuthor = res[0].post.user.username;
        this.reports = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reports:', err);
        this.reports = [];
        this.isLoading = false;
      }
    });
  }

  viewPostDetails() {
   this.router.navigate(['/posts', this.postId]);
  }

  deletePost() {
    this.postService.deletePost(this.postId).subscribe({
      next:(res:any)=>{
        console.log("Deleted successfully");
        this.router.navigate(['/reportedblogs'])
      }
    })
  }

  getImageUrl(path: string): string {
    return `https://yourcdn.com/${path}`; // Customize as needed
  }
}
