import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { SignalRService } from '../../services/signalr.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule
  ],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">BloggingApp</a>
        
        <div class="nav-links">
          <ng-container *ngIf="!isAuthenticated">
            <a routerLink="/auth/sign-in" 
               class="nav-link" 
               [class.active]="currentRoute === '/auth/sign-in'">Sign In</a>
            <a routerLink="/auth/sign-up" 
               class="nav-button"
               [class.active]="currentRoute === '/auth/sign-up'">Sign Up</a>
          </ng-container>
          
          <ng-container *ngIf="isAuthenticated">
            <a routerLink="/" 
               class="nav-link"
               [class.active]="currentRoute === '/'">Dashboard</a>  
            <a routerLink="/posts" 
               class="nav-link"
               [class.active]="currentRoute.startsWith('/posts')">Posts</a>
            <a routerLink="/notifications/posts" 
               class="nav-link notification-link"
               [class.active]="currentRoute.startsWith('/notifications')">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span *ngIf="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
            </a>
            <button (click)="onSignOut()" class="nav-button">Logout</button>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentRoute = '';
  unreadCount = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private signalRService: SignalRService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to auth state changes
    this.authService.isAuthenticated$.subscribe(
      (isAuth: boolean) => this.isAuthenticated = isAuth
    );

    // Track current route for active state
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    // Subscribe to notification count
    this.signalRService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Start SignalR connection if authenticated
    if (this.isAuthenticated) {
      this.signalRService.startConnection();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSignOut() {
    console.log("signout called");
    this.authService.logout().subscribe({
      next: () => {
        console.log("Logout successful");
        this.router.navigate(['/auth/sign-in']);
      },
      error: (error) => {
        console.error("Logout failed:", error);
        // Still navigate to sign-in page even if logout API fails
        this.router.navigate(['/auth/sign-in']);
      },
      complete: () => {
        console.log("Logout completed");
      }
    });
  }
}