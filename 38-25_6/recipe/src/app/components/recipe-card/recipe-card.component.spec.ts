import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeCardComponent } from './recipe-card.component';
import { Recipe } from '../../models/recipe.model';

describe('RecipeCardComponent', () => {
  let component: RecipeCardComponent;
  let fixture: ComponentFixture<RecipeCardComponent>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeCardComponent);
    component = fixture.componentInstance;
    component.recipe = mockRecipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display recipe name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Test Recipe');
  });

  it('should display recipe meta information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const metaInfo = compiled.querySelector('.recipe-meta');
    expect(metaInfo?.textContent).toContain('Prep: 10min');
    expect(metaInfo?.textContent).toContain('Cook: 20min');
    expect(metaInfo?.textContent).toContain('Servings: 4');
  });

  it('should display recipe tags', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tags = compiled.querySelectorAll('.tag');
    expect(tags.length).toBe(1);
    expect(tags[0].textContent).toContain('test');
  });

  it('should emit recipe id when view details button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    
    spyOn(component.viewDetails, 'emit');
    button?.click();
    
    expect(component.viewDetails.emit).toHaveBeenCalledWith(mockRecipe.id);
  });
}); 