import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Profile } from './profile';
import { Component } from '@angular/core';
import { UserService } from '../services/UserService';
import { UserModel } from '../models/UserModel';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

class MockUserService {
  getCurrentUser() {
    return { subscribe: () => {} };
  }
  updateProfile() {
    return { subscribe: () => {} };
  }
}

@Component({
  standalone: true,
  imports: [Profile],
  template: `<app-profile [userData]="user" (profileUpdated)="onProfileUpdate($event)"></app-profile>`
})
class HostComponent {
  user: UserModel | null = null;
  updatedProfile: UserModel | null = null;

  onProfileUpdate(user: UserModel) {
    this.updatedProfile = user;
  }
}

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: UserService, useClass: MockUserService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const profileFixture = TestBed.createComponent(Profile);
    component = profileFixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render user profile when provided', () => {
    hostComponent.user = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      gender: 'male',
      image: 'https://via.placeholder.com/150'
    } as UserModel;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('testuser');
    expect(compiled.textContent).toContain('test@example.com');
  });

  it('should emit profile update event when form is submitted', () => {
    const updatedUser = {
      id: 1,
      username: 'updateduser',
      email: 'updated@example.com',
      fullName: 'Updated User',
      firstName: 'Updated',
      lastName: 'User',
      gender: 'male',
      image: 'https://via.placeholder.com/150'
    } as UserModel;
    
    hostComponent.user = updatedUser;
    fixture.detectChanges();
    
    const profileComponent = fixture.debugElement.query(sel => sel.componentInstance instanceof Profile);
    profileComponent.componentInstance.onSubmit(updatedUser);
    
    expect(hostComponent.updatedProfile).toEqual(updatedUser);
  });

  it('should show empty state when no user data is provided', () => {
    hostComponent.user = null;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.profile-empty-state')).toBeTruthy();
  });
});
