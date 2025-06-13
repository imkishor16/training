import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, interval } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

export interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private weatherDataSubject = new BehaviorSubject<WeatherData | null>(null);
  private searchHistorySubject = new BehaviorSubject<string[]>([]);
  private autoRefreshInterval = 300000; // 5 minutes in milliseconds

  weatherData$ = this.weatherDataSubject.asObservable();
  searchHistory$ = this.searchHistorySubject.asObservable();

  constructor(private http: HttpClient) {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) {
      this.searchHistorySubject.next(JSON.parse(savedHistory));
    }

    // Setup auto-refresh
    interval(this.autoRefreshInterval).pipe(
      switchMap(() => {
        const currentCity = this.weatherDataSubject.value?.name;
        return currentCity ? this.getWeatherForCity(currentCity) : [];
      })
    ).subscribe();
  }

  getWeatherForCity(city: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`).pipe(
      tap(data => {
        this.weatherDataSubject.next(data);
        this.updateSearchHistory(city);
      }),
      catchError(this.handleError)
    );
  }

  private updateSearchHistory(city: string): void {
    const currentHistory = this.searchHistorySubject.value;
    const newHistory = [city, ...currentHistory.filter(c => c !== city)].slice(0, 5);
    this.searchHistorySubject.next(newHistory);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(newHistory));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
