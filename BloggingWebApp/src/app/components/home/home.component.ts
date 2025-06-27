import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Welcome to Blogging Platform</h1>
      <p class="text-gray-600 mb-4">
        This is your home page. Here you can view and manage your blog posts.
      </p>
      
      <!-- Token Debug Information -->
      <!-- <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <h2 class="text-lg font-semibold text-blue-900 mb-2">Authentication Status</h2>
        <div class="space-y-2 text-sm">
          <div><strong>Token in localStorage:</strong> {{ tokenStatus }}</div>
          <div><strong>isAuthenticated():</strong> {{ isAuthenticated }}</div>
          <div><strong>Token Value:</strong> {{ tokenValue || 'No token found' }}</div>
        </div>
        <button 
          (click)="checkToken()" 
          class="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Refresh Token Status
        </button>
        <button 
          (click)="clearToken()" 
          class="mt-3 ml-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          Clear Token
        </button>
      </div> -->
      
      
    </div>
  `
})
export class HomeComponent implements OnInit {
  tokenStatus: string = 'Checking...';
  isAuthenticated: boolean = false;
  tokenValue: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.checkToken();
  }

  checkToken(): void {
    const token = this.authService.getToken();
    this.tokenValue = token;
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (token) {
      this.tokenStatus = '✅ Token found in localStorage';
    } else {
      this.tokenStatus = '❌ No token in localStorage';
    }
  }

  clearToken(): void {
    this.authService.logout();
    this.checkToken();
  }
} 