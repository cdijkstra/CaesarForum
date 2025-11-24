import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserProfileComponent],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('Caesar Forum');
  private userService = inject(UserService);

  // Get current user from service
  currentUser = this.userService.currentUser;
}
