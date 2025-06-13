import { Component } from '@angular/core';
import { UserLoginModel } from '../../Model/UserLoginModel';
import { UserService } from '../../Service/UserService';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  user: UserLoginModel = new UserLoginModel();
  
  constructor(private userService: UserService) {
  }

  handleLogin() {
    this.userService.validateUserLogin(this.user);
  }
}