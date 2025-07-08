import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';  
import { DropdownModule } from 'primeng/dropdown';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/auth.model';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    ToastModule,
    CheckboxModule,
    CalendarModule,
    DropdownModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="edit-profile-container">
      <div class="edit-profile-header">
        <h1>Edit Profile</h1>
        <p>Update your profile information</p>
        <div class="role-badge" [class.admin]="isAdmin">
          {{ user?.role || 'User' }}
        </div>
      </div>

      <div class="edit-profile-content">
        <p-card styleClass="profile-card">
          <div class="profile-form-container">
            <!-- Avatar Section -->
            <div class="avatar-section">
              <p-avatar 
                [label]="user?.username?.charAt(0) || 'U'"
                shape="circle"
                size="xlarge"
                [style]="{ backgroundColor: '#2196F3', color: '#ffffff', width: '120px', height: '120px', fontSize: '3rem' }"
              ></p-avatar>
              <div class="avatar-info">
                <h3>{{ user?.username }}</h3>
                <p class="text-muted">Profile Picture</p>
                <p-button 
                  label="Change Photo" 
                  icon="pi pi-camera"
                  [text]="true"
                  styleClass="p-button-secondary"
                ></p-button>
              </div>
            </div>

            <!-- Form Section -->
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
              <!-- Basic Info Section -->
              <div class="form-section" *ngIf="isEditingOwnProfile">
                <h3>Basic Information</h3>
                <div class="form-row">
                  <div class="form-group">
                    <label for="username">Username</label>
                    <input 
                      id="username"
                      type="text" 
                      pInputText 
                      formControlName="username"
                      placeholder="Enter username"
                      class="w-full"
                    />
                    <small 
                      *ngIf="profileForm.get('username')?.invalid && profileForm.get('username')?.touched"
                      class="p-error"
                    >
                      Username is required
                    </small>
                  </div>

                  <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                      id="email"
                      type="email" 
                      pInputText 
                      formControlName="email"
                      placeholder="Enter email"
                      class="w-full"
                      [disabled]="true"
                    />
                  </div>
                </div>
              </div>

              <!-- Suspension Section: Only for admin editing another user -->
              <div class="form-section" *ngIf="isAdmin && !isEditingOwnProfile">
                <h3>Suspension Controls</h3>
                <div class="form-row">
                  <div class="form-group">
                    <label for="isSuspended">Suspended</label>
                    <div class="checkbox-container">
                      <label class="checkbox-label">
                        <input 
                          type="checkbox" 
                          formControlName="isSuspended"
                          style="margin-right: 8px;"
                        />
                        {{ getSuspensionLabel() }}
                      </label>
                    </div>
                  </div>

                  <div class="form-group" *ngIf="isSuspendedChecked()">
                    <label for="suspendedUntil">Suspended Until</label>
                    <p-calendar 
                      id="suspendedUntil"
                      formControlName="suspendedUntil"
                      [showIcon]="true"
                      dateFormat="dd/mm/yy"
                      placeholder="Select date"
                      class="w-full"
                    ></p-calendar>
                  </div>
                </div>

                <div class="form-group" *ngIf="isSuspendedChecked()">
                  <label for="suspensionReason">Suspension Reason</label>
                  <textarea 
                    id="suspensionReason"
                    formControlName="suspensionReason"
                    placeholder="Enter suspension reason..."
                    rows="3"
                    class="w-full"
                  ></textarea>
                  <small 
                    *ngIf="profileForm.get('suspensionReason')?.invalid && profileForm.get('suspensionReason')?.touched"
                    class="p-error"
                  >
                    Suspension reason is required when user is suspended
                  </small>
                </div>
              </div>

              <!-- User Info Display - For non-admin users -->
              <div class="form-section" *ngIf="!isAdmin && !isEditingOwnProfile">
                <h3>Account Information</h3>
                <div class="info-display">
                  <div class="info-row">
                    <span class="info-label">Role:</span>
                    <span class="info-value">{{ user?.role }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">{{ user?.status || 'Active' }}</span>
                  </div>
                  <div class="info-row" *ngIf="user?.isSuspended">
                    <span class="info-label">Suspended:</span>
                    <span class="info-value warning">Yes</span>
                  </div>
                  <div class="info-row" *ngIf="user?.suspendedUntil">
                    <span class="info-label">Suspended Until:</span>
                    <span class="info-value warning">{{ user?.suspendedUntil | date:'medium' }}</span>
                  </div>
                  <div class="info-row" *ngIf="user?.suspensionReason">
                    <span class="info-label">Reason:</span>
                    <span class="info-value warning">{{ user?.suspensionReason }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Created:</span>
                    <span class="info-value">{{ user?.createdAt | date:'medium' }}</span>
                  </div>
                  <div class="info-row" *ngIf="user?.lastLoginAt">
                    <span class="info-label">Last Login:</span>
                    <span class="info-value">{{ user?.lastLoginAt | date:'medium' }}</span>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <p-button 
                  type="button"
                  label="Cancel" 
                  icon="pi pi-times"
                  styleClass="p-button-secondary"
                  (onClick)="onCancel()"
                ></p-button>
                <p-button 
                  type="submit"
                  label="Save Changes" 
                  icon="pi pi-check"
                  [loading]="isLoading"
                  [disabled]="!isFormValid() || isLoading"
                  styleClass="save-button"
                ></p-button>
              </div>
            </form>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .edit-profile-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .edit-profile-header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
    }

    .edit-profile-header h1 {
      margin: 0 0 0.5rem;
      color: var(--text-color);
      font-size: 2rem;
    }

    .edit-profile-header p {
      margin: 0 0 1rem;
      color: var(--text-color-secondary);
      font-size: 1.1rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      background: #e9ecef;
      color: #6c757d;
    }

    .role-badge.admin {
      background: #dc3545;
      color: white;
    }

    .edit-profile-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .profile-form-container {
      padding: 2rem;
    }

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e9ecef;
    }

    .avatar-info h3 {
      margin: 0 0 0.5rem;
      color: var(--text-color);
    }

    .avatar-info p {
      margin: 0 0 1rem;
      color: var(--text-color-secondary);
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      background: #f8f9fa;
    }

    .form-section h3 {
      margin: 0 0 1rem;
      color: var(--text-color);
      font-size: 1.2rem;
      border-bottom: 2px solid #dee2e6;
      padding-bottom: 0.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.25rem;
    }

    .form-group input,
    .form-group textarea {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 0.75rem;
      transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
      outline: none;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-label {
      font-size: 0.875rem;
      color: var(--text-color);
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .info-display {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: white;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }

    .info-label {
      font-weight: 600;
      color: var(--text-color);
    }

    .info-value {
      color: var(--text-color-secondary);
    }

    .info-value.warning {
      color: #dc3545;
      font-weight: 600;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
    }

    .text-muted {
      color: var(--text-color-secondary);
    }

    .p-error {
      color: #dc3545;
    }

    /* Button styling */
    ::ng-deep .save-button {
      background: #2196F3;
      border: 2px solid #2196F3;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
    }

    ::ng-deep .save-button:hover:not(:disabled) {
      background: #1976D2;
      border-color: #1976D2;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
    }

    ::ng-deep .save-button:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
    }

    ::ng-deep .save-button:disabled {
      background: #ccc;
      border-color: #ccc;
      color: #666;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .edit-profile-container {
        padding: 10px;
      }

      .avatar-section {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class EditProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  isLoading = false;
  isAdmin = false;
  isEditingOwnProfile = false;

  roleOptions = [
    { label: 'User', value: 'User' },
    { label: 'Admin', value: 'Admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      status: ['', [Validators.required]],
      isSuspended: [false],
      suspendedUntil: [null],
      suspensionReason: ['']  // Remove required validator, will be handled conditionally
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id');
      if (userId) {
        this.loadUserData(userId);
      } else {
        // If no userId in route, redirect to current user's edit profile
        const currentUserId = this.authService.getCurrentUserId();
        if (currentUserId) {
          this.router.navigate(['/profile', currentUserId, 'edit']);
        }
      }
    });
    this.checkUserRole();

    // Subscribe to form value changes to trigger change detection
    this.profileForm.valueChanges.subscribe(values => {
      console.log('Form values changed:', values);
    });
  }

  private checkUserRole() {
    const userRole = this.authService.getCurrentUserRole();
    this.isAdmin = userRole === 'Admin';
  }

  private checkIfEditingOwnProfile() {
    const currentUserId = this.authService.getCurrentUserId();
    const routeUserId = this.route.snapshot.paramMap.get('id');
    this.isEditingOwnProfile = currentUserId === routeUserId;
  }

    private loadUserData(userId?: string) {
    const targetUserId = userId || this.authService.getCurrentUserId();
    if (!targetUserId) {
      console.error('No user ID found');
      return;
    }

    this.userService.getUserById(targetUserId).subscribe({
      next: (userData) => {
        this.user = userData;
        this.checkIfEditingOwnProfile();
        this.populateForm();
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user data. Please try again.'
        });
      }
    });
  }

  private populateForm() {
    if (this.user) {
      console.log('Populating form with user data:', this.user);
      const isSuspended = this.user.isSuspended === true; // Explicitly convert to boolean
      console.log('isSuspended value:', isSuspended, 'type:', typeof isSuspended);
      
      this.profileForm.patchValue({
        username: this.user.username || '',
        email: this.user.email || '',
        role: this.user.role || 'User',
        status: this.user.status || '',
        isSuspended: isSuspended,
        suspendedUntil: this.user.suspendedUntil ? new Date(this.user.suspendedUntil) : null,
        suspensionReason: this.user.suspensionReason || ''
      });
      console.log('Form values after patch:', this.profileForm.value);
      // Force change detection
      this.cdr.detectChanges();
    }
  }

  onSubmit() {
    if (this.isFormValid() && this.user) {
      this.isLoading = true;
      const formData = this.profileForm.value;
      const userId = this.user.id;
      
      if (!userId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'User ID not found. Please try again.'
        });
        this.isLoading = false;
        return;
      }

      // Build complete user payload for PUT operation
      const updateData: any = {
        id: this.user.id,
        email: this.user.email,
        username: this.user.username,
        role: this.user.role,
        status: this.user.status,
        isSuspended: this.user.isSuspended,
        suspensionReason: this.user.suspensionReason,
        suspendedUntil: this.user.suspendedUntil,
        createdAt: this.user.createdAt,
        lastLoginAt: this.user.lastLoginAt
      };

      // Update only the allowed fields based on user role and permissions
      if (this.isAdmin && !this.isEditingOwnProfile) {
        // Admin editing another user: only suspension fields
        updateData.isSuspended = formData.isSuspended || false;
        updateData.suspendedUntil = formData.suspendedUntil ? formData.suspendedUntil.toISOString() : null;
        updateData.suspensionReason = formData.suspensionReason || (formData.isSuspended ? 'Suspended by admin' : '');
      } else if (this.isEditingOwnProfile) {
        // Editing own profile: only username
        updateData.username = formData.username;
      } else {
        // Regular user: only username
        updateData.username = formData.username;
      }

      this.userService.updateUser(userId, updateData).subscribe({
        next: () => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile updated successfully!'
          });
          this.loadUserData();
          
          setTimeout(() => {
            if (this.user?.id) {
              this.router.navigate(['/profile', this.user.id]);
            } else {
              this.router.navigate(['/profile']);
            }
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to update profile. Please try again.'
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    if (this.user?.id) {
      this.router.navigate(['/profile', this.user.id]);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  isFormValid(): boolean {
    // Basic validation for username
    const usernameValid = this.profileForm.get('username')?.valid || false;
    const usernameValue = this.profileForm.get('username')?.value;
    
    // Username must be valid and not empty
    if (!usernameValid || !usernameValue || usernameValue.trim().length < 3) {
      return false;
    }
    
    // For admin users editing another user's profile, validate suspension fields
    if (this.isAdmin && !this.isEditingOwnProfile) {
      const isSuspended = this.profileForm.get('isSuspended')?.value;
      const suspensionReason = this.profileForm.get('suspensionReason')?.value;
      
      // If suspended, suspension reason is required
      if (isSuspended && (!suspensionReason || suspensionReason.trim() === '')) {
        return false;
      }
      
      return usernameValid;
    }
    
    // For regular users or admin editing own profile, only validate username
    return usernameValid;
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  getSuspensionLabel(): string {
    const isSuspended = this.profileForm.get('isSuspended')?.value;
    console.log('getSuspensionLabel called, isSuspended:', isSuspended);
    return isSuspended ? 'User is suspended' : 'User is not suspended';
  }

  isSuspendedChecked(): boolean {
    const isSuspended = this.profileForm.get('isSuspended')?.value;
    console.log('isSuspendedChecked called, isSuspended:', isSuspended);
    return isSuspended === true;
  }
} 