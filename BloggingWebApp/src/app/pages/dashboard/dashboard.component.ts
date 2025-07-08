import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service'; 
import { Post } from '../../models/post.model';
import { User } from '../../models/auth.model';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { EditUserModalComponent } from '../../components/edit-user-modal/edit-user-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PostCardComponent, EditUserModalComponent],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Welcome back, {{ username }}!</h1>
      </header>

      <section class="dashboard-stats">
        <div class="stat-card">
          <h3>Your Posts</h3>
          <p class="stat-number">{{ userPosts.length }}</p>
        </div>
        <div class="stat-card" *ngIf="isAdmin">
          <h3>Total Users</h3>
          <p class="stat-number">{{ allUsers.length }}</p>
        </div>
        <div class="stat-card" *ngIf="isAdmin">
          <h3>Regular Users</h3>
          <p class="stat-number">{{ regularUsers.length }}</p>
        </div>
      </section>

      <section class="dashboard-actions">
        <button (click)="createNewPost()" class="action-button">Create New Post</button>
        <a routerLink="/profile/{{userId}}" class="action-button secondary">View Profile</a>
        <button 
          *ngIf="isAdmin"
          (click)="toggleUsersList()" 
          class="action-button admin-button"
        >
          {{ showUsersList ? 'Hide Users' : 'View All Users' }}
        </button>
      </section>

      <!-- Suspension Alert -->
      <div *ngIf="showSuspensionAlert" class="suspension-alert">
        <div class="alert-content">
          <h3>Account Suspended</h3>
          <p><strong>Reason:</strong> {{ suspensionReason }}</p>
          <p *ngIf="suspendedUntil"><strong>Suspended until:</strong> {{ suspendedUntil | date:'medium' }}</p>
          <button (click)="closeSuspensionAlert()" class="alert-close-btn">Close</button>
        </div>
      </div>

      <!-- Admin Users Table -->
      <section class="users-section" *ngIf="isAdmin && showUsersList">
        <h2>User Management</h2>
        
        <!-- Users Grid View -->
        <div class="view-toggle">
          <button 
            class="toggle-btn" 
            [class.active]="!showTableView"
            (click)="showTableView = false"
          >
            Grid View
          </button>
          <button 
            class="toggle-btn" 
            [class.active]="showTableView"
            (click)="showTableView = true"
          >
            Table View
          </button>
        </div>

        <!-- Grid View -->
        <div class="users-grid" *ngIf="!showTableView && !isLoadingUsers">
          <div 
            *ngFor="let user of allUsers" 
            class="user-card"
            (click)="viewUserProfile(user.id)"
          >
            <div class="user-avatar">
              {{ user.username.charAt(0) || 'U' }}
            </div>
            <div class="user-info">
              <h4>{{ user.username }}</h4>
              <p>{{ user.email }}</p>
              <span class="user-role" [class.admin-role]="user.role === 'Admin'">
                {{ user.role }}
              </span>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div class="users-table-container" *ngIf="showTableView && !isLoadingUsers">
          <table class="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of regularUsers">
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" [class.admin-role]="user.role === 'Admin'">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class.suspended]="user.isSuspended">
                    {{ user.isSuspended ? 'Suspended' : 'Active' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn btn-view"
                      (click)="viewUserProfile(user.id)"
                    >
                      View
                    </button>
                    <button 
                      class="btn btn-edit"
                      (click)="openEditModal(user)"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="loading-container" *ngIf="isLoadingUsers">
          <div class="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </section>

      <section class="recent-posts" *ngIf="userPosts.length > 0">
        <h2>Your Recent Posts</h2>
        <div class="posts-grid">
          <app-post-card 
            *ngFor="let post of userPosts" 
            [post]="post"
          ></app-post-card>
        </div>
      </section>

      <!-- Edit User Modal -->
      <app-edit-user-modal
        *ngIf="showEditModal"
        [user]="selectedUser"
        (userUpdated)="onUserUpdated($event)"
        (modalClosed)="closeEditModal()"
      ></app-edit-user-modal>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      color: #333;
    }

    .dashboard-stats {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
    }

    .dashboard-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .action-button {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }

    .action-button:not(.secondary):not(.admin-button) {
      background: #007bff;
      color: white;
    }

    .action-button.secondary {
      background: #e9ecef;
      color: #333;
    }

    .action-button.admin-button {
      background: #dc3545;
      color: white;
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .users-section {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .users-section h2 {
      margin-bottom: 1rem;
      color: #333;
    }

    .view-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .toggle-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .user-card:hover {
      background: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
    }

    .user-info {
      flex: 1;
    }

    .user-info h4 {
      margin: 0 0 0.25rem;
      color: #333;
    }

    .user-info p {
      margin: 0 0 0.5rem;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .user-role {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e9ecef;
      color: #6c757d;
    }

    .user-role.admin-role {
      background: #dc3545;
      color: white;
    }

    .users-table-container {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .users-table th,
    .users-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    .users-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .users-table tr:hover {
      background: #f8f9fa;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e9ecef;
      color: #6c757d;
    }

    .role-badge.admin-role {
      background: #dc3545;
      color: white;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #28a745;
      color: white;
    }

    .status-badge.suspended {
      background: #dc3545;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-view {
      background: #007bff;
      color: white;
    }

    .btn-view:hover {
      background: #0056b3;
    }

    .btn-edit {
      background: #ffc107;
      color: #333;
    }

    .btn-edit:hover {
      background: #e0a800;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .recent-posts {
      margin-top: 2rem;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .suspension-alert {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .alert-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .alert-content h3 {
      color: #dc3545;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .alert-content p {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .alert-close-btn {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .alert-close-btn:hover {
      background: #5a6268;
    }
  `]
})
export class DashboardComponent implements OnInit {
  username: string = '';
  userPosts: Post[] = [];
  allUsers: User[] = [];
  isAdmin: boolean = false;
  showUsersList: boolean = false;
  showTableView: boolean = false;
  isLoadingUsers: boolean = false;
  showEditModal: boolean = false;
  selectedUser: User | null = null;
  userId: string = '';
  showSuspensionAlert: boolean = false;
  suspensionReason: string = '';
  suspendedUntil: Date | null = null;
  constructor(
    private authService: AuthService,
    private postService: PostService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get user info
    this.authService.getCurrentUser().subscribe(user => {
      this.username = user?.username || 'User';
      this.userId = user?.id || '';
    });

    // Check if user is admin
    const userRole = this.authService.getCurrentUserRole();
    this.isAdmin = userRole === 'Admin';

    // Get user's posts
    this.loadUserPosts();
  }

  get regularUsers(): User[] {
    return this.allUsers.filter(user => user.role === 'User');
  }

  private async loadUserPosts() {
    try {
      // Assuming postService has a method to get user's posts
      this.userPosts = await this.postService.getUserPosts();
    } catch (error) {
      console.error('Error loading user posts:', error);
      this.userPosts = [];
    }
  }

  toggleUsersList() {
    this.showUsersList = !this.showUsersList;
    if (this.showUsersList && this.allUsers.length === 0) {
      this.loadAllUsers();
    }
  }

  private loadAllUsers() {
    this.isLoadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoadingUsers = false;
      }
    });
  }

  viewUserProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  openEditModal(user: User) {
    this.selectedUser = user;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  onUserUpdated(updatedUser: User) {
    // Update the user in the local array
    const index = this.allUsers.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.allUsers[index] = updatedUser;
    }
    this.closeEditModal();
  }

  createNewPost() {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      console.error('No user ID found');
      return;
    }

    // Check if user is suspended before allowing post creation
    this.userService.getUserById(currentUserId).subscribe({
      next: (user) => {
        if (user.isSuspended) {
          // Show suspension alert
          this.suspensionReason = user.suspensionReason || 'No reason provided';
          this.suspendedUntil = user.suspendedUntil ? new Date(user.suspendedUntil) : null;
          this.showSuspensionAlert = true;
        } else {
          // User is not suspended, proceed to create post
          this.router.navigate(['/posts/new']);
        }
      },
      error: (error) => {
        console.error('Error checking user suspension status:', error);
        // If we can't check suspension status, allow the user to proceed
        this.router.navigate(['/posts/new']);
      }
    });
  }

  checkSuspension() {
    // This method is no longer needed as suspension check is now in createNewPost
    console.log('Suspension check moved to createNewPost method');
  }

  closeSuspensionAlert() {
    this.showSuspensionAlert = false;
  }
} 