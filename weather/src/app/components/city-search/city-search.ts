import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WeatherService } from '../../services/weather';

@Component({
  selector: 'app-city-search',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatButtonModule, MatFormFieldModule],
  template: `
    <div class="search-container">
      <mat-form-field appearance="outline">
        <mat-label>Enter City Name</mat-label>
        <input matInput [(ngModel)]="cityName" (keyup.enter)="searchCity()" placeholder="e.g., London">
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="searchCity()">Search</button>
    </div>
  `,
  styles: [`
    .search-container {
      display: flex;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
    }
    mat-form-field {
      flex: 1;
    }
  `]
})
export class CitySearchComponent {
  cityName: string = '';

  constructor(private weatherService: WeatherService) {}

  searchCity(): void {
    if (this.cityName.trim()) {
      this.weatherService.getWeatherForCity(this.cityName.trim());
      this.cityName = '';
    }
  }
}
