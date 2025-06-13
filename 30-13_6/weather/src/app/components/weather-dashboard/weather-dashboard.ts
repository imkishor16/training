import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CitySearchComponent } from '../city-search/city-search.component';
import { WeatherCardComponent } from '../weather-card/weather-card.component';
import { WeatherService, WeatherData } from '../../services/weather';

@Component({
  selector: 'app-weather-dashboard',
  standalone: true,
  imports: [CommonModule, CitySearchComponent, WeatherCardComponent, MatSnackBarModule],
  template: `
    <div class="dashboard-container">
      <h1>Weather Dashboard</h1>
      <app-city-search></app-city-search>
      
      <div class="weather-display">
        <app-weather-card
          *ngIf="currentWeather$ | async as weather"
          [weatherData]="weather">
        </app-weather-card>
      </div>

      <div class="search-history" *ngIf="(searchHistory$ | async)?.length">
        <h2>Recent Searches</h2>
        <div class="history-buttons">
          <button mat-button
                  *ngFor="let city of searchHistory$ | async"
                  (click)="searchCity(city)">
            {{ city }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 {
      text-align: center;
      margin-bottom: 2rem;
    }
    .weather-display {
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }
    .search-history {
      margin-top: 2rem;
    }
    .history-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  `]
})
export class WeatherDashboardComponent {
  currentWeather$ = this.weatherService.weatherData$;
  searchHistory$ = this.weatherService.searchHistory$;

  constructor(
    private weatherService: WeatherService,
    private snackBar: MatSnackBar
  ) {
    // Subscribe to weather data errors
    this.weatherService.weatherData$.subscribe({
      error: (error) => {
        this.snackBar.open(error.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  searchCity(city: string): void {
    this.weatherService.getWeatherForCity(city);
  }
}
