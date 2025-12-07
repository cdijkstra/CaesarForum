import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserProfileComponent } from './components/user-profile/user-profile';
import { UserService } from './services/user.service';
import { LoginComponent } from './components/login/login';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserProfileComponent, LoginComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Caesar Forum');
  private userService = inject(UserService);

  // Get current user from service
  currentUser = this.userService.currentUser;

  // Authentication state
  isAuthenticated = this.userService.isAuthenticated;

  // Login modal visibility
  showLoginModal = signal(false);

  // Open login modal
  openLogin() {
    this.showLoginModal.set(true);
  }

  // Close login modal
  closeLogin() {
    this.showLoginModal.set(false);
  }

  // Logout
  logout() {
    this.userService.logout();
  }
}
