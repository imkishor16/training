import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { WeatherData } from '../../services/weather';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card *ngIf="weatherData" class="weather-card">
      <mat-card-header>
        <mat-card-title>{{ weatherData.name }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="weather-info">
          <div class="main-info">
            <img [src]="'https://openweathermap.org/img/wn/' + weatherData.weather[0].icon + '@2x.png'"
                 [alt]="weatherData.weather[0].description">
            <div class="temperature">{{ weatherData.main.temp | number:'1.0-0' }}°C</div>
          </div>
          <div class="weather-description">
            {{ weatherData.weather[0].description | titlecase }}
          </div>
          <div class="details">
            <div class="detail-item">
              <mat-icon>water_drop</mat-icon>
              <span>Humidity: {{ weatherData.main.humidity }}%</span>
            </div>
            <div class="detail-item">
              <mat-icon>air</mat-icon>
              <span>Wind: {{ weatherData.wind.speed }} m/s</span>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .weather-card {
      max-width: 400px;
      margin: 1rem;
    }
    .weather-info {
      padding: 1rem;
    }
    .main-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .temperature {
      font-size: 2.5rem;
      font-weight: bold;
    }
    .weather-description {
      text-align: center;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    .details {
      display: flex;
      justify-content: space-around;
    }
    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class WeatherCardComponent {
  @Input() weatherData: WeatherData | null = null;
}
