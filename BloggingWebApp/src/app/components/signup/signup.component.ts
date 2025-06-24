import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { signUp } from '../../store/auth/auth.actions';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private store: Store) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.store.dispatch(signUp({ request: this.signupForm.value }));
    }
  }
} 