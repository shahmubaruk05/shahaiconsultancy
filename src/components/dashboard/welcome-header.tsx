'use client';
import { getUser } from '@/lib/auth';
import React from 'react';

export function WelcomeHeader() {
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    getUser().then(user => {
      if (user) {
        setName(user.name.split(' ')[0]);
      }
    });
  }, []);

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
