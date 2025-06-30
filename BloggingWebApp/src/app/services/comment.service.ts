import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Comment, UpdateCommentDto } from '../models/post.model';
import { API_ENDPOINTS } from './api';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  addComment(postId: string, content: string, userId: string): Observable<Comment> {
    const payload = {
      postId,
      userId,
      content,
      status: 'Approved' // Optional: ideally set by backend
    };

    return this.http.post<Comment>(API_ENDPOINTS.ADD_COMMENT, payload, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken() ?? ''}`
      }
    }).pipe(catchError(this.handleError));
  }

  updateComment(commentId: string, updateData: UpdateCommentDto): Observable<Comment> {
    updateData.status = 'Approved'; // Optional: backend should validate
    return this.http.put<Comment>(
      API_ENDPOINTS.UPDATE_COMMENT(commentId),
      updateData,
      {
        headers: {
          Authorization: `Bearer ${this.authService.getToken() ?? ''}`
        }
      }
    ).pipe(catchError(this.handleError));
  }

  // Soft-delete: status → Deleted
  deleteComment(commentId: string): Observable<Comment> {
    const updateData: UpdateCommentDto = {
      status: 'Deleted'
    };
    return this.updateComment(commentId, updateData);
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
