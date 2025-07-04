import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
    <div class="sign-up-container">
      <h2 class="sign-up-title">Sign Up</h2>
      
      <form [formGroup]="signUpForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label" for="username">Username</label>
          <input 
            class="form-input"
            id="username" 
            type="text" 
            formControlName="username"
            placeholder="Choose a username"
          />
          <div class="error-message" *ngIf="signUpForm.get('username')?.touched && signUpForm.get('username')?.errors?.['required']">
            Username is required
          </div>
          <div class="error-message" *ngIf="signUpForm.get('username')?.touched && signUpForm.get('username')?.errors?.['minlength']">
            Username must be at least 3 characters
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input 
            class="form-input"
            id="email" 
            type="email" 
            formControlName="email"
            placeholder="Enter your email"
          />
          <div class="error-message" *ngIf="signUpForm.get('email')?.touched && signUpForm.get('email')?.errors?.['required']">
            Email is required
          </div>
          <div class="error-message" *ngIf="signUpForm.get('email')?.touched && signUpForm.get('email')?.errors?.['email']">
            Please enter a valid email
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input 
            class="form-input"
            id="password" 
            type="password"
            formControlName="password"
            placeholder="Create a password"
          />
          <div class="error-message" *ngIf="signUpForm.get('password')?.touched && signUpForm.get('password')?.errors?.['required']">
            Password is required
          </div>
          <div class="error-message" *ngIf="signUpForm.get('password')?.touched && signUpForm.get('password')?.errors?.['minlength']">
            Password must be at least 6 characters
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="confirmPassword">Confirm Password</label>
          <input 
            class="form-input"
            id="confirmPassword" 
            type="password"
            formControlName="confirmPassword"
            placeholder="Confirm your password"
          />
          <div class="error-message" *ngIf="signUpForm.get('confirmPassword')?.touched && signUpForm.get('confirmPassword')?.errors?.['required']">
            Please confirm your password
          </div>
          <div class="error-message" *ngIf="signUpForm.errors?.['mismatch']">
            Passwords do not match
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="adminSecret">Admin Secret (Optional)</label>
          <input 
            class="form-input"
            id="adminSecret" 
            type="password"
            formControlName="adminSecret"
            placeholder="Enter admin secret to get admin privileges"
          />
          <div class="form-hint">
            Leave empty for regular user account
          </div>
        </div>

        <button 
          type="submit" 
          class="submit-button"
          [disabled]="signUpForm.invalid || isLoading"
        >
          {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
        </button>

        <div class="error-message text-center" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="sign-in-link">
          Already have an account? <a routerLink="/auth/sign-in">Sign In</a>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  signUpForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      adminSecret: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { confirmPassword, adminSecret, ...signUpData } = this.signUpForm.value;
      
      // Check if admin secret is provided and correct
      if (adminSecret) {
        signUpData.role = 'Admin';
        signUpData.adminSecret = adminSecret;
      }
      
      this.authService.signUp(signUpData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/auth/sign-in'], {
            queryParams: { message: 'Account created successfully! Please sign in.' }
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to create account. Please try again.';
          console.error('Sign up error:', error);
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.signUpForm.controls).forEach(key => {
        const control = this.signUpForm.get(key);
        control?.markAsTouched();
      });
    }
  }
} 