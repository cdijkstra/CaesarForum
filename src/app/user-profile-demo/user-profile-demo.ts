import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent, UserProfile } from '../user-profile/user-profile';

@Component({
  selector: 'app-user-profile-demo',
  standalone: true,
  imports: [CommonModule, UserProfileComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          User Profile Component Demo
        </h1>

        <!-- Different Sizes -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-800">Different Sizes</h2>
          <div class="space-y-6">
            <div class="flex items-center gap-6">
              <span class="text-sm text-gray-500 w-20">Small:</span>
              <app-user-profile [user]="userWithPhoto" size="sm" />
            </div>
            <div class="flex items-center gap-6">
              <span class="text-sm text-gray-500 w-20">Medium:</span>
              <app-user-profile [user]="userWithPhoto" size="md" />
            </div>
            <div class="flex items-center gap-6">
              <span class="text-sm text-gray-500 w-20">Large:</span>
              <app-user-profile [user]="userWithPhoto" size="lg" />
            </div>
          </div>
        </div>

        <!-- With and Without Photos -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-800">With Photo vs Initials</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold mb-4 text-gray-700">With Profile Picture</h3>
              <app-user-profile [user]="userWithPhoto" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4 text-gray-700">With Initials Only</h3>
              <app-user-profile [user]="userWithoutPhoto" />
            </div>
          </div>
        </div>

        <!-- Border Variations -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-800">Border Variations</h2>
          <div class="space-y-6">
            <div class="flex items-center gap-6">
              <span class="text-sm text-gray-500 w-32">With Border:</span>
              <app-user-profile [user]="userWithPhoto" [showBorder]="true" />
            </div>
            <div class="flex items-center gap-6">
              <span class="text-sm text-gray-500 w-32">Without Border:</span>
              <app-user-profile [user]="userWithPhoto" [showBorder]="false" />
            </div>
          </div>
        </div>

        <!-- Multiple Users List -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold mb-6 text-gray-800">Team Members</h2>
          <div class="space-y-4">
            <div *ngFor="let user of teamMembers" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <app-user-profile [user]="user" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UserProfileDemoComponent {
  userWithPhoto: UserProfile = {
    name: 'Sarah Johnson',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b550?w=150&h=150&fit=crop&crop=face'
  };

  userWithoutPhoto: UserProfile = {
    name: 'Michael Brown'
  };

  teamMembers: UserProfile[] = [
    {
      name: 'Alice Cooper',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Bob Wilson'
    },
    {
      name: 'Charlie Davis',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Diana Prince'
    },
    {
      name: 'Edward Smith',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  ];
}
