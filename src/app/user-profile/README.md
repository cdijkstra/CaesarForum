# User Profile Component

A reusable Angular component for displaying user information with name and profile picture.

## Features

- ✅ **Profile Picture Support** - Shows user's profile picture when available
- ✅ **Fallback Avatar** - Displays user initials when no profile picture is provided  
- ✅ **Multiple Sizes** - Small, medium, and large size options
- ✅ **Border Options** - Optional decorative border around avatar
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Error Handling** - Falls back to initials if image fails to load
- ✅ **Tailwind Styling** - Consistent with your design system

## Usage

### Basic Usage

```typescript
// In your component
import { UserProfileComponent, UserProfile } from '../user-profile/user-profile';

@Component({
  // ... other config
  imports: [UserProfileComponent],
})
export class YourComponent {
  user: UserProfile = {
    name: 'John Doe',
    profilePicture: 'https://example.com/profile.jpg' // Optional
  };
}
```

```html
<!-- In your template -->
<app-user-profile [user]="user" />
```

### Advanced Usage

```html
<!-- Different sizes -->
<app-user-profile [user]="user" size="sm" />
<app-user-profile [user]="user" size="md" />  <!-- Default -->
<app-user-profile [user]="user" size="lg" />

<!-- Without border -->
<app-user-profile [user]="user" [showBorder]="false" />

<!-- All options combined -->
<app-user-profile 
  [user]="user" 
  size="lg" 
  [showBorder]="true" 
/>
```

## Interface

```typescript
export interface UserProfile {
  name: string;
  profilePicture?: string; // Optional
}
```

## Component Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `user` | `UserProfile` | **Required** | User data with name and optional profile picture |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the component |
| `showBorder` | `boolean` | `true` | Whether to show decorative border around avatar |

## Styling

The component uses Tailwind CSS classes and follows your existing design system:

- **Gradient Avatars** - Purple to violet gradient for initials
- **Rounded Design** - Consistent with your app's rounded corners
- **Shadow Effects** - Subtle shadows for depth
- **Hover Animations** - Smooth transitions on interaction

## Examples

### User with Profile Picture
```typescript
const userWithPhoto: UserProfile = {
  name: 'Sarah Johnson',
  profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b550'
};
```

### User without Profile Picture (Shows Initials)
```typescript
const userWithInitials: UserProfile = {
  name: 'Michael Brown' // Will show "MB" in gradient avatar
};
```

## Error Handling

If a profile picture URL fails to load, the component automatically falls back to showing the user's initials in a gradient avatar. This ensures a consistent user experience even with broken image URLs.
