import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recipe-card" *ngIf="recipe">
      <img *ngIf="recipe.image" [src]="recipe.image" [alt]="recipe.name" class="recipe-image">
      <div class="recipe-content">
        <h3>{{ recipe.name }}</h3>
        <div class="recipe-meta">
          <span>Prep: {{ recipe.prepTimeMinutes }}min</span>
          <span>Cook: {{ recipe.cookTimeMinutes }}min</span>
          <span>Servings: {{ recipe.servings }}</span>
        </div>
        <div class="recipe-tags">
          <span class="tag" *ngFor="let tag of recipe.tags">{{ tag }}</span>
        </div>
        <button (click)="onViewDetails()">View Details</button>
      </div>
    </div>
  `,
  styles: [`
    .recipe-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      margin: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    
    .recipe-card:hover {
      transform: translateY(-5px);
    }
    
    .recipe-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .recipe-content {
      padding: 1rem;
    }
    
    .recipe-meta {
      display: flex;
      gap: 1rem;
      margin: 0.5rem 0;
      color: #666;
    }
    
    .recipe-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }
    
    .tag {
      background: #f0f0f0;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }
    
    button:hover {
      background: #0056b3;
    }
  `]
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Output() viewDetails = new EventEmitter<number>();

  onViewDetails(): void {
    this.viewDetails.emit(this.recipe.id);
  }
} 