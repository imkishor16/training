import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Post,
  PostListResponse,
  PostResponse,
  Comment,
  Image,
  Like,
  UpdatePostDto,
  CreatePostDto
} from '../models/post.model';
import { API_ENDPOINTS } from './api';
import { createAppError } from '../models/error.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  private getAuthHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.authService.getToken() ?? ''}`
      }
    };
  }

  getAllPosts(page = 1, pageSize = 10): Observable<PostListResponse> {
    const params = { page: page.toString(), pageSize: pageSize.toString() };
    return this.http
      .get<PostListResponse>(API_ENDPOINTS.GET_ALL_POSTS, { ...this.getAuthHeaders(), params })
      .pipe(catchError(this.handleError));
  }

  getPosts(): Observable<Post[]> {
    return this.http
      .get<Post[]>(API_ENDPOINTS.GET_ALL_POSTS, this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  getPostById(id: string): Observable<PostResponse> {
    return this.http
      .get<PostResponse>(API_ENDPOINTS.GET_POST_BY_ID(id), this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  createPost(data: CreatePostDto | FormData): Observable<Post> {
    return this.http
      .post<Post>(API_ENDPOINTS.CREATE_POST, data, this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  updatePost(id: string, data: UpdatePostDto | FormData): Observable<Post> {
    return this.http
      .put<Post>(API_ENDPOINTS.UPDATE_POST(id), data, this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  deletePost(postId: string): Observable<Post> {
    const updateData: UpdatePostDto = { postStatus: 'Deleted' };
    return this.updatePost(postId, updateData);
  }

  getPostComments(postId: string): Observable<Comment[]> {
    return this.http
      .get<Comment[]>(API_ENDPOINTS.GET_POST_COMMENTS(postId), this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  getPostImages(postId: string): Observable<Image[]> {
    return this.http
      .get<Image[]>(API_ENDPOINTS.GET_POST_IMAGES(postId), this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  getPostLikes(postId: string): Observable<Like[]> {
    return this.http
      .get<Like[]>(API_ENDPOINTS.GET_POST_LIKES(postId), this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  likePost(postId: string): Observable<any> {
    const payload = {
      postId,
      userId: this.authService.getCurrentUserId(),
      isLiked: true
    };
    return this.http
      .put(API_ENDPOINTS.LIKE_POST, payload, this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  unlikePost(postId: string): Observable<any> {
    const payload = {
      postId,
      userId: this.authService.getCurrentUserId(),
      isLiked: false
    };
    return this.http
      .put(API_ENDPOINTS.LIKE_POST, payload, this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  // You can remove toggleLike() to avoid ambiguity unless your API supports it explicitly.
  toggleLike(postId: string): Observable<Post> {
    return this.http
      .post<Post>(`${API_ENDPOINTS.LIKE_POST}/${postId}`, {}, this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  convertImageContent(content: string): string {
    return `data:image/jpeg;base64,${content}`;
  }

  async getUserPosts(): Promise<Post[]> {
    const currentUserId = this.authService.getCurrentUserId();
    return firstValueFrom(
      this.getPosts().pipe(
        map(posts => posts.filter(post => post.userId === currentUserId))
      )
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const appError = createAppError(error);
    return throwError(() => appError);
  }
}
