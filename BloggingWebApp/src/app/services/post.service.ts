import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, firstValueFrom, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
  private postUpdateSubject = new Subject<{ type: 'like' | 'unlike' | 'comment' | 'uncomment', postId: string }>();
  public postUpdate$ = this.postUpdateSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return {
      headers: {
        'Authorization': `Bearer ${token ?? ''}`,
        'Content-Type': 'application/json'
      }
    };
  }

  private getFormDataHeaders() {
    const token = this.authService.getToken();
    return {
      headers: {
        'Authorization': `Bearer ${token ?? ''}`
      }
    };
  }

  getAllPosts(page = 1, pageSize = 10): Observable<PostListResponse> {
    const params = { page: page.toString(), pageSize: pageSize.toString() };
    return this.http
      .get<PostListResponse>(API_ENDPOINTS.GET_ALL_POSTS, { ...this.getAuthHeaders(), params })
      .pipe(
        tap(response => console.log('getAllPosts response:', response)),
        catchError(this.handleError)
      );
  }

  getPosts(): Observable<Post[]> {
    return this.http
      .get<Post[]>(API_ENDPOINTS.GET_ALL_POSTS, this.getAuthHeaders())
      .pipe(
        tap(response => console.log('getPosts response:', response)),
        catchError(this.handleError)
      );
  }

  getPostById(id: string): Observable<PostResponse> {
    return this.http
      .get<PostResponse>(API_ENDPOINTS.GET_POST_BY_ID(id), this.getAuthHeaders())
      .pipe(
        tap(response => console.log('getPostById response:', response)),
        catchError(this.handleError)
      );
  }

  createPost(data: CreatePostDto | FormData): Observable<Post> {
    const headers = data instanceof FormData ? this.getFormDataHeaders() : this.getAuthHeaders();
    console.log('Creating post with data:', data);
    return this.http
      .post<Post>(API_ENDPOINTS.CREATE_POST, data, headers)
      .pipe(
        tap(response => console.log('createPost response:', response)),
        catchError(this.handleError)
      );
  }

  updatePost(id: string, data: UpdatePostDto | FormData): Observable<Post> {
    const headers = data instanceof FormData ? this.getFormDataHeaders() : this.getAuthHeaders();
    console.log('Updating post with data:', data);
    return this.http
      .put<Post>(API_ENDPOINTS.UPDATE_POST(id), data, headers)
      .pipe(
        tap(response => console.log('updatePost response:', response)),
        catchError(this.handleError)
      );
  }

  deletePost(postId: string): Observable<Post> {
    const updateData: UpdatePostDto = { postStatus: 'Deleted' };
    return this.updatePost(postId, updateData);
  }

  getPostComments(postId: string): Observable<Comment[]> {
    return this.http
      .get<Comment[]>(API_ENDPOINTS.GET_POST_COMMENTS(postId), this.getAuthHeaders())
      .pipe(
        tap(response => console.log('getPostComments response:', response)),
        catchError(this.handleError)
      );
  }

  getPostImages(postId: string): Observable<Image[]> {
    return this.http
      .get<Image[]>(API_ENDPOINTS.GET_POST_IMAGES(postId), this.getAuthHeaders())
      .pipe(
        tap(response => console.log('getPostImages response:', response)),
        catchError(this.handleError)
      );
  }

  getPostLikes(postId: string): Observable<Like[]> {
    return this.http
      .get<Like[]>(API_ENDPOINTS.GET_POST_LIKES(postId), this.getAuthHeaders())
      .pipe(
        tap(response => console.log('getPostLikes response:', response)),
        catchError(this.handleError)
      );
  }

  likePost(postId: string): Observable<any> {
    const payload = {
      postId,
      userId: this.authService.getCurrentUserId(),
      isLiked: true
    };
    console.log('Liking post with payload:', payload);
    return this.http
      .put(API_ENDPOINTS.LIKE_POST, payload, this.getAuthHeaders())
      .pipe(
        tap(response => {
          console.log('likePost response:', response);
          this.postUpdateSubject.next({ type: 'like', postId });
        }),
        catchError(this.handleError)
      );
  }

  unlikePost(postId: string): Observable<any> {
    const payload = {
      postId,
      userId: this.authService.getCurrentUserId(),
      isLiked: false
    };
    console.log('Unliking post with payload:', payload);
    return this.http
      .put(API_ENDPOINTS.LIKE_POST, payload, this.getAuthHeaders())
      .pipe(
        tap(response => {
          console.log('unlikePost response:', response);
          this.postUpdateSubject.next({ type: 'unlike', postId });
        }),
        catchError(this.handleError)
      );
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
    if (!currentUserId) return [];
    
    console.log('Getting posts for user:', currentUserId);
    return firstValueFrom(
      this.http.get<Post[]>(API_ENDPOINTS.GET_USER_POSTS(currentUserId), this.getAuthHeaders())
        .pipe(
          tap(response => console.log('getUserPosts response:', response)),
          catchError(this.handleError)
        )
    );
  }

  async getLikedPosts(): Promise<Post[]> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) return [];
    
    console.log('Getting liked posts for user:', currentUserId);
    return firstValueFrom(
      this.http.get<Post[]>(API_ENDPOINTS.GET_USER_LIKED_POSTS(currentUserId), this.getAuthHeaders())
        .pipe(
          tap(response => console.log('getLikedPosts response:', response)),
          catchError(this.handleError)
        )
    );
  }

  async getCommentedPosts(): Promise<Post[]> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) return [];
    
    console.log('Getting commented posts for user:', currentUserId);
    return firstValueFrom(
      this.http.get<Post[]>(API_ENDPOINTS.GET_USER_COMMENTED_POSTS(currentUserId), this.getAuthHeaders())
        .pipe(
          tap(response => console.log('getCommentedPosts response:', response)),
          catchError(this.handleError)
        )
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    const appError = createAppError(error);
    return throwError(() => appError);
  }
}


