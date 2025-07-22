import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CreateReportDto, Report} from '../models/report.model';
import { API_ENDPOINTS } from './api';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  addReport(report: Partial<CreateReportDto>): Observable<Report> {
    return this.http.post<Report>(API_ENDPOINTS.ADD_REPORT, report, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken() ?? ''}`
      }
    }).pipe(catchError(this.handleError));
  }

  reportStatus(postId: string): Observable<any> {
    const params = { postId: postId};
    return this.http.get<any>(API_ENDPOINTS.GET_REPORT_STATUS, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken() ?? ''}`
      },
      params
    }).pipe(catchError(this.handleError));
  }

  getFilteredReports(postId: string, category?: string): Observable<Report[]> {
    let params = new HttpParams().set('postId', postId);

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<any>(API_ENDPOINTS.GET_REPORTS_BY_ID, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken() ?? ''}`
      },
      params
    }).pipe(
      tap(response => console.log('reports:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Error: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => errorMessage);
  }
}
