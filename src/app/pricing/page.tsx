'use client';
import { useState, useEffect, useTransition } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type UserPlan = 'free' | 'pro' | 'premium';

export default function PricingPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);
  const currentPlan = (userData?.plan as UserPlan) || 'free';

  const checkout = async (plan: UserPlan) => {
    if (!user || !userDocRef) {
      router.push('/login');
      return;
    }

    startTransition(async () => {
        try {
            await setDoc(userDocRef, { plan: plan }, { merge: true });
            // Optionally, show a success toast
        } catch (error) {
            console.error('An error occurred during checkout:', error);
             // Optionally, show an error toast
        }
    });
  };

  const isLoading = isUserLoading || isUserDocLoading;

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
  }

  if (!user) {
    return (
        <div className="p-4 sm:p-8 text-center">
            <h1 className="text-3xl font-bold">Please Log In</h1>
            <p className="text-muted-foreground mt-2 mb-4">You need to be logged in to manage your plan.</p>
            <Button asChild>
                <Link href="/login">Log In</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Upgrade Your Plan</h1>
        <p className="text-lg text-muted-foreground mt-2">Choose the plan that best fits your startup's needs.</p>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-8">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Pro Plan</CardTitle>
            <CardDescription>For founders ready to create professional assets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-4xl font-bold">
                $9 <span className="text-lg font-normal text-muted-foreground">/ mo</span>
            </div>
            <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> All Core AI Tools</li>
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Business Plan Downloads</li>
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Company Profile Downloads</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
                onClick={() => checkout('pro')} 
                className="w-full" 
                size="lg"
                disabled={isPending || currentPlan === 'pro'}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentPlan === 'pro' ? 'Current Plan' : 'Subscribe to Pro'}
            </Button>
          </CardFooter>
        </Card>

        <Card className={cn("w-full max-w-sm shadow-xl relative overflow-hidden", currentPlan === 'premium' && 'border-2 border-primary')}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold rounded-b-md">
                Most Popular
            </div>
          <CardHeader className="pt-10">
            <CardTitle className="text-2xl">Premium Plan</CardTitle>
            <CardDescription>For founders who want unlimited access and support.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">
                $19 <span className="text-lg font-normal text-muted-foreground">/ mo</span>
            </div>
             <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Unlimited AI Tool Usage</li>
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Unlimited "Ask Shah" Chat</li>
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Priority Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
                onClick={() => checkout('premium')} 
                className="w-full bg-accent hover:bg-accent/90" 
                size="lg"
                disabled={isPending || currentPlan === 'premium'}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentPlan === 'premium' ? 'Current Plan' : 'Subscribe to Premium'}
            </Button>
          </CardFooter>
        </Card>
      </div>
       <div className="text-center mt-8">
            <Button
                onClick={() => checkout('free')}
                variant="link"
                disabled={isPending || currentPlan === 'free'}
            >
                {currentPlan !== 'free' && 'Downgrade to Free plan'}
            </Button>
        </div>
    </div>
  );
}
