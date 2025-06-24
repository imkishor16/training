import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload-component';
import { Component } from '@angular/core';
import { BulkInsertService } from '../services/BulkInsertService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

class MockFileUploadService {
  uploadFile() {
    return { subscribe: () => {} };
  }
}

@Component({
  standalone: true,
  imports: [FileUploadComponent],
  template: `<app-file-upload (fileUploaded)="onFileUploaded($event)"></app-file-upload>`
})
class HostComponent {
  uploadedFile: File | null = null;
  uploadResponse: any = null;

  onFileUploaded(response: any) {
    this.uploadResponse = response;
  }
}

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: BulkInsertService, useClass: MockFileUploadService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const uploadFixture = TestBed.createComponent(FileUploadComponent);
    component = uploadFixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should handle file selection', () => {
    const fileUploadComponent = fixture.debugElement.query(sel => sel.componentInstance instanceof FileUploadComponent);
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    const mockEvent = {
      target: {
        files: [testFile]
      }
    };

    fileUploadComponent.componentInstance.onFileSelected(mockEvent);
    expect(fileUploadComponent.componentInstance.selectedFile).toEqual(testFile);
  });

  it('should show error for invalid file type', () => {
    const fileUploadComponent = fixture.debugElement.query(sel => sel.componentInstance instanceof FileUploadComponent);
    const invalidFile = new File(['test content'], 'test.exe', { type: 'application/x-msdownload' });
    
    const mockEvent = {
      target: {
        files: [invalidFile]
      }
    };

    fileUploadComponent.componentInstance.onFileSelected(mockEvent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-message')).toBeTruthy();
  });

  it('should show upload progress', () => {
    const fileUploadComponent = fixture.debugElement.query(sel => sel.componentInstance instanceof FileUploadComponent);
    fileUploadComponent.componentInstance.uploadProgress = 50;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.progress-bar')).toBeTruthy();
    expect(compiled.textContent).toContain('50%');
  });
});
