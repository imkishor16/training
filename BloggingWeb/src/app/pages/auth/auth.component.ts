import { Component } from '@angular/core';

import { SigninComponent } from '../../components/signin/signin.component';
import { SignupComponent } from '../../components/signup/signup.component';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  standalone: true,
  imports: [SigninComponent, SignupComponent]
})
export class AuthComponent {
  activeTab: 'signin' | 'signup' = 'signin';

  setActiveTab(tab: 'signin' | 'signup'): void {
    this.activeTab = tab;
  }
} 