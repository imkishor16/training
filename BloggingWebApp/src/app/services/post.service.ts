import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Post, PostListResponse, PostResponse } from '../models/post.model';
import { API_ENDPOINTS } from './api';
import { createAppError } from '../models/error.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private readonly http: HttpClient, private readonly authService: AuthService) {}

  getAllPosts(page: number = 1, pageSize: number = 10): Observable<PostListResponse> {
    const params = { page: page.toString(), pageSize: pageSize.toString() };
    return this.http.get<PostListResponse>(API_ENDPOINTS.GET_ALL_POSTS, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getPostById(id: string): Observable<PostResponse> {
    return this.http.get<PostResponse>(API_ENDPOINTS.GET_POST_BY_ID(id))
      .pipe(
        catchError(this.handleError)
      );
  }

  createPost(formData: FormData): Observable<any> {
    return this.http.post(API_ENDPOINTS.GET_ALL_POSTS, formData , {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const appError = createAppError(error);
    return throwError(() => appError);
  }
} 