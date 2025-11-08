// This is a mock authentication file.
// In a real application, you would use a proper authentication library
// like NextAuth.js or Firebase Auth.
import { User as FirebaseUser } from 'firebase/auth';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
};

export function toAppUser(firebaseUser: FirebaseUser): User {
  return {
    name: firebaseUser.displayName || firebaseUser.email || 'Anonymous',
    email: firebaseUser.email || 'anonymous@example.com',
    avatarUrl: firebaseUser.photoURL || PlaceHolderImages.find(p => p.id === 'user-avatar')?.imageUrl || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
  };
}

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
  // This is now effectively a mock. Use useUser() from firebase/provider.tsx
  return null;
}
