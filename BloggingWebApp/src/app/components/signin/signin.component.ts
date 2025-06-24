import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { signIn } from '../../store/auth/auth.actions';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SigninComponent {
  signinForm: FormGroup;

  constructor(private fb: FormBuilder, private store: Store) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.signinForm.valid) {
      this.store.dispatch(signIn({ request: this.signinForm.value }));
    }
  }
} 