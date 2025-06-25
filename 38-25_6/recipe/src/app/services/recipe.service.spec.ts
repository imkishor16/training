import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecipeService } from './recipe.service';
import { Recipe, RecipeResponse } from '../models/recipe.model';

describe('RecipeService', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecipeService]
    });
    service = TestBed.inject(RecipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch recipes', () => {
    const mockResponse: RecipeResponse = {
      recipes: [{
        id: 1,
        name: 'Test Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        servings: 4,
        difficulty: 'Easy',
        cuisine: 'Italian',
        caloriesPerServing: 300,
        tags: ['test'],
        userId: 1
      }],
      total: 1,
      skip: 0,
      limit: 10
    };

    service.getRecipes().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://dummyjson.com/recipes?limit=10&skip=0');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch recipe by id', () => {
    const mockRecipe: Recipe = {
      id: 1,
      name: 'Test Recipe',
      ingredients: ['ingredient1'],
      instructions: ['step1'],
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'Italian',
      caloriesPerServing: 300,
      tags: ['test'],
      userId: 1
    };

    service.getRecipeById(1).subscribe(recipe => {
      expect(recipe).toEqual(mockRecipe);
    });

    const req = httpMock.expectOne('https://dummyjson.com/recipes/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockRecipe);
  });

  it('should search recipes', () => {
    const mockResponse: RecipeResponse = {
      recipes: [{
        id: 1,
        name: 'Test Recipe',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        servings: 4,
        difficulty: 'Easy',
        cuisine: 'Italian',
        caloriesPerServing: 300,
        tags: ['test'],
        userId: 1
      }],
      total: 1,
      skip: 0,
      limit: 10
    };

    service.searchRecipes('test').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://dummyjson.com/recipes/search?q=test');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
}); 