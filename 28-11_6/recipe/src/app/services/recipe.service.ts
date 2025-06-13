import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Recipe, RecipeResponse } from '../models/recipe.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipes = signal<Recipe[]>([]);
  private apiUrl = 'https://dummyjson.com/recipes';

  constructor(private http: HttpClient) {}

  getRecipes(): Observable<RecipeResponse> {
    return this.http.get<RecipeResponse>(this.apiUrl).pipe(
      tap(response => {
        this.recipes.set(response.recipes);
      })
    );
  }

  getRecipesSignal() {
    return this.recipes;
  }

  clearRecipes() {
    this.recipes.set([]);
  }
} 