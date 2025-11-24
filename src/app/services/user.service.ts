import { Injectable, signal } from '@angular/core';
import { UserProfile } from '../user-profile/user-profile';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Current user profile - in a real app this would come from authentication
  private currentUserSignal = signal<UserProfile>({
    name: 'John Doe',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  // Read-only access to current user
  currentUser = this.currentUserSignal.asReadonly();

  // Method to update current user (for future authentication integration)
  setCurrentUser(user: UserProfile): void {
    this.currentUserSignal.set(user);
  }

  // Get current user name for presenter field
  getCurrentUserName(): string {
    return this.currentUserSignal().name;
  }
}
