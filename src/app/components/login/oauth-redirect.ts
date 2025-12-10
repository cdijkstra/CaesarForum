import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PocketbaseService } from '../../services/pocketbase.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-oauth-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div
          class="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <div
            class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Authenticeren...</h2>
        <p class="text-gray-600">Je wordt doorgestuurd naar de hoofdpagina</p>
      </div>
    </div>
  `,
})
export class OAuthRedirectComponent implements OnInit {
  private router = inject(Router);
  private pocketbaseService = inject(PocketbaseService);
  private userService = inject(UserService);

  async ngOnInit() {
    // PocketBase automatically processes the OAuth callback from the URL parameters
    // The authStore.onChange listener in UserService will update the user state
    // Wait a bit for PocketBase to process the callback
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      if (this.pocketbaseService.isAuthenticated()) {
        // Authentication successful, redirect to home
        this.router.navigate(['/']);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
      attempts++;
    }

    // If we get here, authentication might have failed or is still processing
    // Redirect anyway - the user can try again
    this.router.navigate(['/']);
  }
}
