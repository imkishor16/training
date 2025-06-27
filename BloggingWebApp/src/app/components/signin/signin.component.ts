import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { signInSuccess, signInFailure } from '../../store/auth/auth.actions';

import { ReactiveFormsModule } from '@angular/forms';
import { AppState } from '../../store/app.state';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class SigninComponent {
  signinForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder, 
    private store: Store<AppState>,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.signinForm.valid) {
      this.loading = true;
      
      this.authService.signIn(this.signinForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.authService.setToken(response.token);
          this.store.dispatch(signInSuccess({ user: response.user }));
          this.messageService.showSuccessMessage('SIGNIN');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.showHttpError(error);
          this.store.dispatch(signInFailure({ error: error.message }));
        }
      });
    }
  }
} 