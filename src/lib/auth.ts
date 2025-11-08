// This is a mock authentication file.
// In a real application, you would use a proper authentication library
// like NextAuth.js or Firebase Auth.

import { PlaceHolderImages } from '@/lib/placeholder-images';

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
};

const mockUser: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: PlaceHolderImages.find(p => p.id === 'user-avatar')?.imageUrl || 'https://picsum.photos/seed/user-avatar/100/100',
};

/**
 * A mock function to get the current user.
 * In a real app, this would involve checking a session or token.
 */
export async function getUser(): Promise<User | null> {
  // Simulate an authenticated user.
  // To simulate a logged-out state, return null.
  return mockUser;
}
