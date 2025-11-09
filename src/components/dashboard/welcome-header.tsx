'use client';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import React, { useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { PlanBadge } from '@/components/PlanBadge';

export function WelcomeHeader() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [name, setName] = React.useState('');

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);
  
  useEffect(() => {
    // Wait until user and document data are loaded to avoid race conditions.
    if (!user || !userDocRef || !firestore || isUserLoading || isUserDocLoading) {
      return;
    }
  
    // `userData` can be null if the document doesn't exist yet.
    // We only want to write to Firestore if the document exists and the 'plan' field is missing.
    const planExists = userData && 'plan' in userData;
  
    if (!planExists) {
      // Use { merge: true } to avoid overwriting the whole document.
      // This will create the document if it doesn't exist, or just add the 'plan' field if it does.
      setDoc(userDocRef, { plan: 'free' }, { merge: true });
    }
  }, [user, userData, userDocRef, isUserLoading, isUserDocLoading, firestore]);

  React.useEffect(() => {
    if (user) {
      setName(user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'there');
    }
  }, [user]);

  if (!user) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Shah Mubaruk</h1>
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
