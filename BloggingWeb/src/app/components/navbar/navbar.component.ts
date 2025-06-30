import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState } from '../../store/app.state';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { logout } from '../../store/auth/auth.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-indigo-600">Blogging Platform</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <!-- Show these links when authenticated -->
              @if (isAuthenticated$ | async) {
                <a
                  routerLink="/"
                  routerLinkActive="border-indigo-500 text-gray-900"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                  Home
                </a>
                <a
                  routerLink="/posts"
                  routerLinkActive="border-indigo-500 text-gray-900"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                  Posts
                </a>
                <a
                  routerLink="/profile"
                  routerLinkActive="border-indigo-500 text-gray-900"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                  Profile
                </a>
              }
    
              <!-- Show these links when not authenticated -->
              @if (!(isAuthenticated$ | async)) {
                <a
                  routerLink="/auth"
                  routerLinkActive="border-indigo-500 text-gray-900"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                  Sign In
                </a>
                <a
                  routerLink="/auth"
                  routerLinkActive="border-indigo-500 text-gray-900"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                  Sign Up
                </a>
              }
            </div>
          </div>
    
          <!-- Logout button when authenticated -->
          @if (isAuthenticated$ | async) {
            <div class="flex items-center">
              <button
                (click)="onLogout()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                Logout
              </button>
            </div>
          }
        </div>
      </div>
    </nav>
    `
})
export class NavbarComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.isAuthenticated$ = new Observable<boolean>();
  }

  ngOnInit(): void {
    // Create an observable that checks authentication status from store and service
    this.isAuthenticated$ = this.store.select(state => state.auth.user).pipe(
      map(user => {
        // Check both store state and localStorage token
        return !!user || this.authService.isAuthenticated();
      })
    );
  }

  onLogout(): void {
    this.store.dispatch(logout());
  }
} 