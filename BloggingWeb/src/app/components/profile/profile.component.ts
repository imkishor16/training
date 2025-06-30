import { Component } from '@angular/core';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  template: `
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">User Profile</h1>
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Personal Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Username</label>
              <p class="mt-1 text-sm text-gray-900">user123</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <p class="mt-1 text-sm text-gray-900">user&#64;example.com</p>
            </div>
          </div>
        </div>
        
        <div class="border-b border-gray-200 pb-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Statistics</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-indigo-600">5</div>
              <div class="text-sm text-gray-600">Blog Posts</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-indigo-600">150</div>
              <div class="text-sm text-gray-600">Followers</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-indigo-600">25</div>
              <div class="text-sm text-gray-600">Following</div>
            </div>
          </div>
        </div>
        
        <div>
          <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {} 