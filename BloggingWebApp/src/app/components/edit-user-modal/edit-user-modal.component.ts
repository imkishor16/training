import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../models/auth.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Edit User: {{ user?.username }}</h2>
          <button class="close-button" (click)="closeModal()">×</button>
        </div>

        <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input 
              type="text" 
              class="form-input" 
              [value]="user?.username" 
              readonly
            >
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input 
              type="email" 
              class="form-input" 
              [value]="user?.email" 
              readonly
            >
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <input 
              type="text" 
              class="form-input" 
              [value]="user?.role" 
              readonly
            >
          </div>

          <div class="form-group">
            <label class="form-label">
              <input 
                type="checkbox" 
                formControlName="isSuspended"
                class="checkbox-input"
              >
              Suspend User
            </label>
          </div>

          <div class="form-group" *ngIf="editForm.get('isSuspended')?.value">
            <label class="form-label">Suspension Reason</label>
            <textarea 
              class="form-textarea"
              formControlName="suspensionReason"
              placeholder="Enter reason for suspension"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group" *ngIf="editForm.get('isSuspended')?.value">
            <label class="form-label">Suspended Until</label>
            <input 
              type="datetime-local" 
              class="form-input"
              formControlName="suspendedUntil"
            >
          </div>

          <div class="modal-actions">
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="closeModal()"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="editForm.invalid || isSubmitting"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #333;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }

    .close-button:hover {
      background: #f8f9fa;
      color: #333;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-input:read-only {
      background: #f8f9fa;
      color: #6c757d;
    }

    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      resize: vertical;
    }

    .checkbox-input {
      margin-right: 0.5rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }
  `]
})
export class EditUserModalComponent {
  @Input() user: User | null = null;
  @Output() userUpdated = new EventEmitter<User>();
  @Output() modalClosed = new EventEmitter<void>();

  editForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.editForm = this.fb.group({
      isSuspended: [false],
      suspensionReason: [''],
      suspendedUntil: ['']
    });
  }

  ngOnInit() {
    if (this.user) {
      this.editForm.patchValue({
        isSuspended: this.user.isSuspended || false,
        suspensionReason: this.user.suspensionReason || '',
        suspendedUntil: this.user.suspendedUntil ? this.formatDateForInput(this.user.suspendedUntil) : ''
      });
    }
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  onSubmit() {
    if (this.editForm.valid && this.user) {
      this.isSubmitting = true;
      
      const updateData = {
        isSuspended: this.editForm.get('isSuspended')?.value,
        suspensionReason: this.editForm.get('suspensionReason')?.value,
        suspendedUntil: this.editForm.get('suspendedUntil')?.value
      };

      this.userService.updateUser(this.user.id, updateData).subscribe({
        next: (updatedUser) => {
          this.isSubmitting = false;
          this.userUpdated.emit(updatedUser);
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  closeModal() {
    this.modalClosed.emit();
  }
} 