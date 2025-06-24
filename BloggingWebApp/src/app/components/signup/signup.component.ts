import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { signUpSuccess, signUpFailure } from '../../store/auth/auth.actions';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AppState } from '../../store/app.state';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder, 
    private store: Store<AppState>,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.loading = true;
      
      this.authService.signUp(this.signupForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.authService.setToken(response.token);
          this.store.dispatch(signUpSuccess({ user: response.user }));
          this.messageService.showSuccessMessage('SIGNUP');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.showHttpError(error);
          this.store.dispatch(signUpFailure({ error: error.message }));
        }
      });
    }
  }
} 