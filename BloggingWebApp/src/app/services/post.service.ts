import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Post, PostListResponse, PostResponse, Comment, Image, Like } from '../models/post.model';
import { API_ENDPOINTS } from './api';
import { createAppError } from '../models/error.model';
import { AuthService } from './auth.service';
import { UpdatePostDto } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private readonly http: HttpClient, private readonly authService: AuthService) {}

  getAllPosts(page: number = 1, pageSize: number = 10): Observable<PostListResponse> {
    const params = { page: page.toString(), pageSize: pageSize.toString() };
    return this.http.get<PostListResponse>(API_ENDPOINTS.GET_ALL_POSTS, { params,
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  getPostById(id: string): Observable<PostResponse> {
    return this.http.get<PostResponse>(API_ENDPOINTS.GET_POST_BY_ID(id), {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  createPost(formData: FormData): Observable<any> {
    return this.http.post(API_ENDPOINTS.GET_ALL_POSTS, formData, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getPostComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(API_ENDPOINTS.GET_POST_COMMENTS(postId), {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    })
      .pipe(catchError(this.handleError));
  }

  getPostImages(postId: string): Observable<Image[]> {
    return this.http.get<Image[]>(API_ENDPOINTS.GET_POST_IMAGES(postId), {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    })
      .pipe(catchError(this.handleError));
  }

  likePost(postId: string): Observable<any> {
    const payload = {
      postId: postId,
      userId: this.authService.getCurrentUserId(),
      isLiked: true
    };
    return this.http.put(API_ENDPOINTS.LIKE_POST, payload, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  unlikePost(postId: string): Observable<any> {
    const payload = {
      postId: postId,
      userId: this.authService.getCurrentUserId(),
      isLiked: false
    };
    return this.http.put(API_ENDPOINTS.LIKE_POST, payload, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getPostLikes(postId: string): Observable<Like[]> {
    return this.http.get<Like[]>(API_ENDPOINTS.GET_POST_LIKES(postId), {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    })
      .pipe(catchError(this.handleError));
  }

  convertImageContent(content: string): string {
    return `data:image/jpeg;base64,${content}`;
  }
  

  updatePost(postId: string, updateData: UpdatePostDto): Observable<Post> {
    const formData = new FormData();
    
    if (updateData.title) {
      formData.append('title', updateData.title);
    }
    if (updateData.content) {
      formData.append('content', updateData.content);
    }
    if (updateData.postStatus) {
      formData.append('postStatus', updateData.postStatus);
    }
    if (updateData.images && updateData.images.length > 0) {
      updateData.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    return this.http.put<Post>(`${API_ENDPOINTS.GET_POST_BY_ID(postId)}`, formData, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    }).pipe(catchError(this.handleError));
  }

  deletePost(postId: string): Observable<Post> {
    const updateData: UpdatePostDto = {
      postStatus: 'Deleted'
    };
    return this.updatePost(postId, updateData);
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(API_ENDPOINTS.GET_ALL_POSTS, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    }).pipe(catchError(this.handleError));
  }

  toggleLike(postId: string): Observable<Post> {
    return this.http.post<Post>(`${API_ENDPOINTS.LIKE_POST}/${postId}`, {}, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const appError = createAppError(error);
    return throwError(() => appError);
  }
}