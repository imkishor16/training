import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RecipeCardComponent],
  template: `
    <div class="recipe-list-container">
      <div class="search-container">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          (keyup.enter)="searchRecipes()"
          placeholder="Search recipes..."
          class="search-input"
        >
        <button (click)="searchRecipes()" class="search-button">Search</button>
      </div>

      <div class="recipes-grid" *ngIf="recipes.length > 0">
        <app-recipe-card
          *ngFor="let recipe of recipes"
          [recipe]="recipe"
          (viewDetails)="onViewDetails($event)"
        ></app-recipe-card>
      </div>

      <div *ngIf="recipes.length === 0" class="no-recipes">
        No recipes found.
      </div>

      <div *ngIf="selectedRecipe" class="recipe-details">
        <h2>{{ selectedRecipe.name }}</h2>
        <div class="recipe-info">
          <p><strong>Cuisine:</strong> {{ selectedRecipe.cuisine }}</p>
          <p><strong>Difficulty:</strong> {{ selectedRecipe.difficulty }}</p>
          <p><strong>Calories per Serving:</strong> {{ selectedRecipe.caloriesPerServing }}</p>
        </div>
        
        <div class="recipe-section">
          <h3>Ingredients:</h3>
          <ul>
            <li *ngFor="let ingredient of selectedRecipe.ingredients">
              {{ ingredient }}
            </li>
          </ul>
        </div>

        <div class="recipe-section">
          <h3>Instructions:</h3>
          <ol>
            <li *ngFor="let instruction of selectedRecipe.instructions">
              {{ instruction }}
            </li>
          </ol>
        </div>

        <button (click)="closeDetails()" class="close-button">Close Details</button>
      </div>
    </div>
  `,
  styles: [`
    .recipe-list-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .search-container {
      margin-bottom: 2rem;
      display: flex;
      gap: 1rem;
    }

    .search-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .search-button {
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .search-button:hover {
      background: #0056b3;
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .no-recipes {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .recipe-details {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .recipe-info {
      margin: 1rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .recipe-section {
      margin: 1.5rem 0;
    }

    .recipe-section h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .close-button {
      display: block;
      width: 100%;
      padding: 0.75rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }

    .close-button:hover {
      background: #c82333;
    }
  `]
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  selectedRecipe: Recipe | null = null;
  searchQuery: string = '';

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.recipeService.getRecipes().subscribe(
      response => {
        this.recipes = response.recipes;
      },
      error => {
        console.error('Error loading recipes:', error);
      }
    );
  }

  searchRecipes(): void {
    if (this.searchQuery.trim()) {
      this.recipeService.searchRecipes(this.searchQuery).subscribe(
        response => {
          this.recipes = response.recipes;
        },
        error => {
          console.error('Error searching recipes:', error);
        }
      );
    } else {
      this.loadRecipes();
    }
  }

  onViewDetails(recipeId: number): void {
    this.recipeService.getRecipeById(recipeId).subscribe(
      recipe => {
        this.selectedRecipe = recipe;
      },
      error => {
        console.error('Error loading recipe details:', error);
      }
    );
  }

  closeDetails(): void {
    this.selectedRecipe = null;
  }
} 