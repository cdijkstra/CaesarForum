import { Component, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  private userService = inject(UserService);

  // Output event to close modal
  close = output<void>();

  // Form state
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isFormExpanded = signal(false);

  // Handle form submission
  async onSubmit() {
    const emailValue = this.email().trim();
    const passwordValue = this.password().trim();

    if (!emailValue || !passwordValue) {
      this.errorMessage.set('Voer zowel e-mailadres als wachtwoord in');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const result = await this.userService.login(emailValue, passwordValue);

    if (result.success) {
      this.close.emit();
      // Reset form
      this.email.set('');
      this.password.set('');
    } else {
      this.errorMessage.set(result.error || 'Inloggen mislukt');
    }

    this.isLoading.set(false);
  }

  // Handle Microsoft OAuth login
  onMicrosoftLogin() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.userService.loginWithOAuth2('microsoft');
    // Note: The user will be redirected to Microsoft for authentication
    // The modal will close automatically after redirect
  }

  // Handle close button or overlay click
  onClose() {
    this.close.emit();
  }

  // Prevent modal from closing when clicking inside
  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  // Toggle form expansion
  toggleForm() {
    this.isFormExpanded.set(!this.isFormExpanded());
  }
}
