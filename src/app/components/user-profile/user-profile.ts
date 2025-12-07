import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserProfile {
  name: string;
  profilePicture?: string; // Optional - will show default avatar if not provided
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.html'
})
export class UserProfileComponent {
  // Input for user data
  user = input.required<UserProfile>();

  // Optional styling inputs
  size = input<'sm' | 'md' | 'lg'>('md');
  showBorder = input<boolean>(true);

  // Image error handling
  imageError = signal(false);

  // Handle image loading errors
  handleImageError(): void {
    this.imageError.set(true);
  }

  // Get initials from name for fallback avatar
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Get size classes based on size input
  getSizeClasses(): { container: string, avatar: string, text: string } {
    switch (this.size()) {
      case 'sm':
        return {
          container: 'gap-2',
          avatar: 'w-8 h-8 text-xs',
          text: 'text-sm'
        };
      case 'lg':
        return {
          container: 'gap-4',
          avatar: 'w-16 h-16 text-lg',
          text: 'text-xl font-semibold'
        };
      default: // 'md'
        return {
          container: 'gap-3',
          avatar: 'w-12 h-12 text-base',
          text: 'text-lg font-medium'
        };
    }
  }
}
