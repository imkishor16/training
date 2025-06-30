import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { User } from '../../models/auth.model';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TabViewModule,
    ButtonModule,
    AvatarModule,
    PostCardComponent
  ],
  template: `
    <div class="p-4">
      <div class="container">
        <!-- User Info Card -->
        <p-card styleClass="mb-4">
          <div class="flex align-items-center gap-4">
            <p-avatar 
              [label]="user?.username?.charAt(0) || 'U'"
              shape="circle"
              size="xlarge"
              [style]="{ backgroundColor: '#2196F3', color: '#ffffff', width: '100px', height: '100px', fontSize: '2.5rem' }"
            ></p-avatar>
            <div>
              <h2 class="m-0 mb-2">{{ user?.username }}</h2>
              <p class="m-0 text-500">{{ user?.email }}</p>
              <p-button 
                label="Edit Profile" 
                icon="pi pi-user-edit"
                [text]="true"
                class="mt-2"
              ></p-button>
            </div>
          </div>
        </p-card>

        <!-- Posts Tab View -->
        <p-tabView>
          <p-tabPanel header="My Posts">
            <div class="grid">
              <div *ngFor="let post of userPosts" class="col-12 md:col-6 lg:col-4">
                <app-post-card [post]="post"></app-post-card>
              </div>
              <div *ngIf="userPosts.length === 0" class="col-12 text-center">
                <h3>No posts yet</h3>
                <p-button 
                  label="Create Your First Post" 
                  icon="pi pi-plus"
                  routerLink="/posts/new"
                ></p-button>
              </div>
            </div>
          </p-tabPanel>
          <p-tabPanel header="Liked Posts">
            <div class="grid">
              <div *ngFor="let post of likedPosts" class="col-12 md:col-6 lg:col-4">
                <app-post-card [post]="post"></app-post-card>
              </div>
              <div *ngIf="likedPosts.length === 0" class="col-12 text-center">
                <h3>No liked posts</h3>
                <p>Explore and like posts to see them here!</p>
              </div>
            </div>
          </p-tabPanel>
        </p-tabView>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  userPosts: Post[] = [];
  likedPosts: Post[] = [];

  constructor(
    private authService: AuthService,
    private postService: PostService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.loadUserPosts();
    this.loadLikedPosts();
  }

  private loadUserPosts() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.userPosts = posts;
      },
      error: (error) => {
        console.error('Error loading user posts:', error);
      }
    });
  }

  private loadLikedPosts() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.likedPosts = posts;
      },
      error: (error) => {
        console.error('Error loading liked posts:', error);
      }
    });
  }
} 