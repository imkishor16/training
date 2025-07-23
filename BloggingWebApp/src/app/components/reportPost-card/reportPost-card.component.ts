import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReportedPost } from '../../models/post.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reported-post-card',
  standalone: true,
  imports: [CommonModule,RouterModule],
  template: `
    <div class="reported-card">
      <div class="post-title" >{{ post.title.length > 25 ? (post.title | slice:0:27) + ' ...' : post.title }}</div>

      <div class="author-info">
        <div class="avatar">{{ getInitial(post.user?.username) }}</div>
        <div class="author-meta">
          <div class="author-name">{{ post.user?.username || 'Unknown' }}</div>
          <div class="status-badge" [ngClass]="getStatusClass(post.postStatus)">
            {{ post.postStatus }}
          </div>
        </div>
      </div>

      <div class="card-footer">
        <span class="report-count">
          <strong>{{ post.reportCount || 0 }}</strong> Reports
        </span>
        <button class="view-btn" (click)="viewDetails()">View Details</button>
      </div>
    </div>
  `,
  styleUrls:['./reportPost-card.component.css'],
})
export class ReportedPostCardComponent {
  @Input() post!: ReportedPost;

  constructor( private router: Router){}

  getInitial(name?: string): string {
    return name?.charAt(0).toUpperCase() || 'U';
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

  viewDetails() {
    this.router.navigate(['/reportedblogs', this.post.id]);
  }
}
