import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { AppMessage, MessageType } from '../../models/error.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../models/post.model';
import { AuthService } from '../../services/auth.service';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="currentMessage"
      class="fixed top-4 right-4 z-50 max-w-sm w-full"
      [@slideIn]
      >
      <div
        class="rounded-lg shadow-lg p-4 border-l-4"
        [ngClass]="getMessageClasses()"
        >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg
              *ngIf="currentMessage.type === MessageType.SUCCESS"
              class="h-6 w-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg
              *ngIf="currentMessage.type === MessageType.ERROR"
              class="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg
              *ngIf="currentMessage.type === MessageType.WARNING"
              class="h-6 w-6 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <svg
              *ngIf="currentMessage.type === MessageType.INFO"
              class="h-6 w-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3 w-0 flex-1">
            <h3 class="text-sm font-medium" [ngClass]="getTitleClasses()">
              {{ currentMessage.title }}
            </h3>
            <div class="mt-1 text-sm" [ngClass]="getMessageTextClasses()">
              {{ currentMessage.message }}
            </div>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              (click)="closeMessage()"
              class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    `,
  styles: [`
    :host {
      display: block;
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class MessageComponent implements OnInit, OnDestroy {
  currentMessage: AppMessage | null = null;
  MessageType = MessageType;
  private subscription: Subscription = new Subscription();
  @Input() comment!: Comment;
  @Output() commentUpdated = new EventEmitter<Comment>();
  @Output() commentDeleted = new EventEmitter<string>();

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.subscription = this.messageService.message$.subscribe(
      message => {
        this.currentMessage = message;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closeMessage(): void {
    this.messageService.clearMessage();
  }

  getMessageClasses(): string {
    if (!this.currentMessage) return '';
    
    switch (this.currentMessage.type) {
      case MessageType.SUCCESS:
        return 'bg-green-50 border-green-400';
      case MessageType.ERROR:
        return 'bg-red-50 border-red-400';
      case MessageType.WARNING:
        return 'bg-yellow-50 border-yellow-400';
      case MessageType.INFO:
        return 'bg-blue-50 border-blue-400';
      default:
        return 'bg-gray-50 border-gray-400';
    }
  }

  getTitleClasses(): string {
    if (!this.currentMessage) return '';
    
    switch (this.currentMessage.type) {
      case MessageType.SUCCESS:
        return 'text-green-800';
      case MessageType.ERROR:
        return 'text-red-800';
      case MessageType.WARNING:
        return 'text-yellow-800';
      case MessageType.INFO:
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  }

  getMessageTextClasses(): string {
    if (!this.currentMessage) return '';
    
    switch (this.currentMessage.type) {
      case MessageType.SUCCESS:
        return 'text-green-700';
      case MessageType.ERROR:
        return 'text-red-700';
      case MessageType.WARNING:
        return 'text-yellow-700';
      case MessageType.INFO:
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  }

  get canModify(): boolean {
    return this.isAdmin || this.comment.userId === this.authService.getCurrentUserId();
  }

  get isAdmin(): boolean {
    return this.authService.getCurrentUserRole() === 'Admin';
  }

  startEditing(): void {
    this.comment.isEditing = true;
    this.comment.editContent = this.comment.content;
  }

  cancelEditing(): void {
    this.comment.isEditing = false;
    this.comment.editContent = undefined;
  }

  saveEdit(): void {
    if (this.comment.editContent && this.comment.editContent !== this.comment.content) {
      this.commentService.updateComment(this.comment.id, {
        content: this.comment.editContent
      }).subscribe({
        next: (updatedComment) => {
          this.comment.isEditing = false;
          this.commentUpdated.emit(updatedComment);
          this.messageService.showSuccess('Success', 'Comment updated successfully');
        },
        error: (error) => {
          this.messageService.showHttpError(error);
        }
      });
    } else {
      this.cancelEditing();
    }
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(this.comment.id).subscribe({
        next: () => {
          this.commentDeleted.emit(this.comment.id);
          this.messageService.showSuccess('Success', 'Comment deleted successfully');
        },
        error: (error) => {
          this.messageService.showHttpError(error);
        }
      });
    }
  }
} 