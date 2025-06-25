import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe, RecipeResponse } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly API_URL = 'https://dummyjson.com/recipes';

  constructor(private http: HttpClient) { }

  getRecipes(limit: number = 10, skip: number = 0): Observable<RecipeResponse> {
    return this.http.get<RecipeResponse>(`${this.API_URL}?limit=${limit}&skip=${skip}`);
  }

  getRecipeById(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.API_URL}/${id}`);
  }

  searchRecipes(query: string): Observable<RecipeResponse> {
    return this.http.get<RecipeResponse>(`${this.API_URL}/search?q=${query}`);
  }
} 