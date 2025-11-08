'use client';
import { useUser } from '@/firebase';
import React from 'react';

export function WelcomeHeader() {
  const { user } = useUser();
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (user) {
      setName(user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'there');
    }
  }, [user]);

  if (!name) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Welcome back, {name}!</h1>
      <p className="text-muted-foreground">Here's your command center for your next big idea.</p>
    </div>
  );
}
