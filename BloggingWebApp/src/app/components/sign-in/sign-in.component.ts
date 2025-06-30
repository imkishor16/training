import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
    <div class="sign-in-container">
      <h2 class="sign-in-title">Sign In</h2>
      
      <form [formGroup]="signInForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input 
            class="form-input"
            id="email" 
            type="email" 
            formControlName="email"
            placeholder="Enter your email"
          />
          <div class="error-message" *ngIf="signInForm.get('email')?.touched && signInForm.get('email')?.errors?.['required']">
            Email is required
          </div>
          <div class="error-message" *ngIf="signInForm.get('email')?.touched && signInForm.get('email')?.errors?.['email']">
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
            placeholder="Enter your password"
          />
          <div class="error-message" *ngIf="signInForm.get('password')?.touched && signInForm.get('password')?.errors?.['required']">
            Password is required
          </div>
          
        </div>

        <button 
          type="submit" 
          class="submit-button"
          [disabled]="signInForm.invalid || isLoading"
        >
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="error-message text-center" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="sign-up-link">
          Don't have an account? <a routerLink="/auth/sign-up">Sign Up</a>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  signInForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit() {
    if (this.signInForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.signIn(this.signInForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          // Get return URL from route parameters or default to '/'
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to sign in. Please try again.';
          console.error('Sign in error:', error);
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.signInForm.controls).forEach(key => {
        const control = this.signInForm.get(key);
        control?.markAsTouched();
      });
    }
  }
} 