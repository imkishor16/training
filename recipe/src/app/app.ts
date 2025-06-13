import { Component } from '@angular/core';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RecipeListComponent],
  template: `
    <main>
      <h1>Recipe Collection</h1>
      <app-recipe-list></app-recipe-list>
    </main>
  `,
  styles: [`
    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }
  `]
})
export class AppComponent {
  title = 'recipe';
}
