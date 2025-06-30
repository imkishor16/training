import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostEditorComponent } from '../../components/post-editor/post-editor.component';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    PostEditorComponent
  ],
  template: `
    <div class="create-post-page">
      <app-post-editor></app-post-editor>
    </div>
  `,
  styles: [`
    .create-post-page {
      min-height: 100vh;
      background-color: #f9fafb;
    }
  `]
})
export class CreatePostComponent {
  constructor(private router: Router) {}
} 