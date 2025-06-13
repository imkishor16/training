import { Component, inject, OnInit, signal } from '@angular/core';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {
  private recipeService = inject(RecipeService);
  recipes = this.recipeService.getRecipesSignal();
  isLoading = signal(true);

  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    this.isLoading.set(true);
    this.recipeService.getRecipes().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  clearRecipes() {
    this.recipeService.clearRecipes();
  }
} 