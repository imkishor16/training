import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

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
            <button (click)="onSignOut()" class="nav-button">Logout</button>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  currentRoute = '';

  constructor(
    private authService: AuthService,
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
      }
    });
  }
}