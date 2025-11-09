'use client';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '../ui/button';
import { setDoc, doc } from 'firebase/firestore';
import { PlanBadge } from '@/components/PlanBadge';

export function WelcomeHeader() {
  const { user, firestore } = useFirebase();
  const [name, setName] = React.useState('');

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);
  
  useEffect(() => {
    if (user && !userData?.plan && userDocRef) {
        setDoc(userDocRef, { plan: 'free' }, { merge: true });
    }
  }, [user, userData, userDocRef])

  React.useEffect(() => {
    if (user) {
      setName(user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'there');
    }
  }, [user]);

  if (!user) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Shah Mubaruk – Your Startup Coach</h1>
        <p className="text-muted-foreground">AI-Powered Business Tools for Visionaries</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {name}!</h1>
        <p className="text-muted-foreground">Here's your command center for your next big idea.</p>
      </div>
       <div>
        <PlanBadge />
      </div>
    </div>
  );
}
