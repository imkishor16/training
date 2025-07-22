import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { PostService } from '../../services/post.service';
import { ReportedPostCardComponent } from '../../components/reportPost-card/reportPost-card.component';
import { ReportedPost } from '../../models/post.model';

@Component({
  selector: 'app-reported-blogs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReportedPostCardComponent
  ],
  template: `
    <div class="reported-posts-container">
      <h1>Reported Blogs</h1>

      <div *ngIf="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading reported posts...</p>
      </div>

      <ng-container *ngIf="!isLoading && reportedPosts.length > 0; else noReports">
        <div class="reported-posts-grid">
          <app-reported-post-card
            *ngFor="let post of reportedPosts"
            [post]="post"
          ></app-reported-post-card>
        </div>
      </ng-container>

      <ng-template #noReports>
        <div class="no-reports">
          <p>No reported blogs found.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .reported-posts-container {
      padding: 20px;
      max-width: 1200px;
      margin: auto;
    }

    .loading-container, .no-reports {
      text-align: center;
      margin-top: 40px;
      color: #777;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #ddd;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .reported-posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      margin-top: 40px;
    }
  `]
})
export class ReportedBlogsComponent implements OnInit, OnDestroy {
  reportedPosts: ReportedPost[] = [];
  isLoading = false;

  constructor(
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchReportedPosts();
  }

  ngOnDestroy(): void {}

  fetchReportedPosts(): void {
    this.isLoading = true;
    this.postService.getReportedPost().subscribe({
      next:(res)=>{
        this.reportedPosts = res;
        console.log(this.reportedPosts);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
        this.isLoading = false;
      }
    })
  }
}
