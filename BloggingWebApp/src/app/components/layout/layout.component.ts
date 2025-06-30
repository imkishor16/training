import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent
  ],
  template: `
    <div class="layout-container">
      <app-navbar></app-navbar>
      
      <main class="main-content">
        <ng-content></ng-content>
      </main>

      <footer class="text-center">
      </footer>
    </div>
  `,
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {} 