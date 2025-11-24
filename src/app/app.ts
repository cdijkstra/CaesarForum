import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserProfileComponent, UserProfile } from './user-profile/user-profile';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserProfileComponent],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('CaesarForum');

  // Current user profile - in a real app this would come from an authentication service
  currentUser: UserProfile = {
    name: 'Bert de Vries',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  };
}
