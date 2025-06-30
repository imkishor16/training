import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SignInComponent } from '../../components/sign-in/sign-in.component';
import { SignUpComponent } from '../../components/sign-up/sign-up.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SignInComponent,
    SignUpComponent
  ],
  template: `
    <div class="surface-ground min-h-screen flex align-items-center justify-content-center">
      <div class="surface-card border-round shadow-2 p-4" style="min-width: 400px;">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AuthComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Redirect to home if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }
} 