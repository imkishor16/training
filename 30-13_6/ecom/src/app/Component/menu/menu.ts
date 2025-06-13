import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../Service/UserService';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit, OnDestroy {
  username$: any;
  usrname: string | null = "";
  cartCount: number = 0;
  isMenuOpen: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.username$.subscribe({
      next: (value) => {
        this.usrname = value;
      },
      error: (err) => {
        alert(err);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription if needed
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleLogout() {
    this.userService.logout();
  }
}