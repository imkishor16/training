import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeListComponent } from './recipe-list.component';
import { RecipeService } from '../../services/recipe.service';
import { Recipe, RecipeResponse } from '../../models/recipe.model';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('RecipeListComponent', () => {
  let component: RecipeListComponent;
  let fixture: ComponentFixture<RecipeListComponent>;
  let recipeService: jasmine.SpyObj<RecipeService>;

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

  const mockRecipeResponse: RecipeResponse = {
    recipes: [mockRecipe],
    total: 1,
    skip: 0,
    limit: 10
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('RecipeService', ['getRecipes', 'searchRecipes', 'getRecipeById']);
    spy.getRecipes.and.returnValue(of(mockRecipeResponse));
    spy.searchRecipes.and.returnValue(of(mockRecipeResponse));
    spy.getRecipeById.and.returnValue(of(mockRecipe));

    await TestBed.configureTestingModule({
      imports: [RecipeListComponent, FormsModule],
      providers: [
        { provide: RecipeService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeListComponent);
    component = fixture.componentInstance;
    recipeService = TestBed.inject(RecipeService) as jasmine.SpyObj<RecipeService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load recipes on init', () => {
    expect(recipeService.getRecipes).toHaveBeenCalled();
    expect(component.recipes).toEqual([mockRecipe]);
  });

  it('should search recipes when search query is not empty', () => {
    component.searchQuery = 'test';
    component.searchRecipes();
    
    expect(recipeService.searchRecipes).toHaveBeenCalledWith('test');
    expect(component.recipes).toEqual([mockRecipe]);
  });

  it('should load all recipes when search query is empty', () => {
    component.searchQuery = '';
    component.searchRecipes();
    
    expect(recipeService.getRecipes).toHaveBeenCalled();
    expect(component.recipes).toEqual([mockRecipe]);
  });

  it('should load recipe details when viewing details', () => {
    component.onViewDetails(1);
    
    expect(recipeService.getRecipeById).toHaveBeenCalledWith(1);
    expect(component.selectedRecipe).toEqual(mockRecipe);
  });

  it('should close recipe details', () => {
    component.selectedRecipe = mockRecipe;
    component.closeDetails();
    
    expect(component.selectedRecipe).toBeNull();
  });
}); 