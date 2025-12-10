import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile } from '../components/user-profile/user-profile';
import { PocketbaseService } from './pocketbase.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private pocketbaseService = inject(PocketbaseService);

  // Current user profile - null when not authenticated
  private currentUserSignal = signal<UserProfile | null>(null);

  // Read-only access to current user
  currentUser = this.currentUserSignal.asReadonly();

  // Authentication state - computed from user signal
  isAuthenticated = computed(() => {
    const user = this.currentUserSignal();
    const pbAuth = this.pocketbaseService.isAuthenticated();
    return pbAuth && user !== null;
  });

  constructor() {
    // Check for existing session on initialization
    this.checkAuthStatus();

    // Listen for auth state changes
    this.pocketbaseService.client.authStore.onChange(() => {
      this.checkAuthStatus();
    });
  }

  // Generate DiceBear emoji avatar URL
  private getDiceBearAvatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`;
  }

  // Check authentication status and update user
  checkAuthStatus(): void {
    if (this.pocketbaseService.isAuthenticated()) {
      const pbUser: User | null = this.pocketbaseService.getCurrentUser();
      if (pbUser) {
        const displayName = pbUser.name || pbUser.email || 'User';
        const avatarSeed = pbUser.email || pbUser.name || 'User';
        this.currentUserSignal.set({
          name: displayName,
          profilePicture: this.getDiceBearAvatarUrl(avatarSeed),
        });
      }
    } else {
      this.currentUserSignal.set(null);
    }
  }

  // Login with email/username and password (tries regular user first, then superuser)
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    let user: User | null = null;
    let error: any = null;

    // Try regular user login first
    try {
      user = await this.pocketbaseService.login(email, password);
    } catch (regularError: any) {
      // If regular login fails, try superuser login
      try {
        user = await this.pocketbaseService.loginSuperuser(email, password);
      } catch (superuserError: any) {
        // Both logins failed
        error = superuserError;
      }
    }

    // If we have a user (from either regular or superuser login), update state
    if (user) {
      const displayName = user.name || user.email || 'User';
      const avatarSeed = user.email || user.name || 'User';
      // Update signal immediately - this should trigger computed signal update
      this.currentUserSignal.set({
        name: displayName,
        profilePicture: this.getDiceBearAvatarUrl(avatarSeed),
      });
      return { success: true };
    }

    // If both logins failed, return error
    const errorMessage = error?.message || 'Login failed. Please check your credentials.';
    return { success: false, error: errorMessage };
  }

  // Login with OAuth2 provider
  loginWithOAuth2(provider: string): void {
    this.pocketbaseService.loginWithOAuth2(provider);
    // Note: The user will be redirected to the OAuth provider
    // After authentication, PocketBase will redirect back and the authStore.onChange listener will handle updating the user state
  }

  // Logout
  logout(): void {
    this.pocketbaseService.logout();
    this.currentUserSignal.set(null);
  }

  // Get current user name for presenter field
  getCurrentUserName(): string {
    return this.currentUserSignal()?.name || '';
  }
}
