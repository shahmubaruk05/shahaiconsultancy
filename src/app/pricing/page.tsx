"use client";
import { useState, useEffect, useTransition } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type UserPlan = 'free' | 'pro' | 'premium';

export default function PricingPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);
  const currentPlan = (userData?.plan as UserPlan) || 'free';

  const [currency, setCurrency] = useState<"USD" | "BDT">("USD");

  const isUSD = currency === "USD";

  const prices = {
    pro: isUSD ? "$9" : "৳999",
    premium: isUSD ? "$19" : "৳1,999",
    suffix: isUSD ? "/ mo" : "/ মাস",
  };
  
  const handlePayment = (plan: 'pro' | 'premium') => {
    if (currency === 'USD') {
        let url;
        if (plan === 'pro') {
            url = process.env.NEXT_PUBLIC_PAYPAL_PRO_URL;
        } else {
            url = process.env.NEXT_PUBLIC_PAYPAL_PREMIUM_URL;
        }

        if (!url || url === '#') {
            toast({
                variant: 'destructive',
                title: 'Payment Link Not Configured',
                description: 'The PayPal payment link for this plan is not set up yet. Please contact support.',
            });
            return;
        }
        window.open(url, '_blank');
    } else { // BDT
        toast({
            title: 'Coming Soon',
            description: 'bKash payment will be available soon. For now, please pay in USD via PayPal.',
        });
    }
  };

  const checkout = async (plan: UserPlan) => {
    if (!user || !userDocRef) {
      router.push('/login');
      return;
    }

    startTransition(async () => {
        try {
            await setDoc(userDocRef, { plan: plan }, { merge: true });
            toast({ title: 'Plan Updated', description: `Your plan has been changed to ${plan}.`});
        } catch (error) {
            console.error('An error occurred during checkout:', error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update your plan.'});
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

        <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
            <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 rounded-full transition ${
                isUSD ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
            >
                USD $
            </button>
            <button
                type="button"
                onClick={() => setCurrency("BDT")}
                className={`px-3 py-1 rounded-full transition ${
                !isUSD ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
            >
                BDT ৳
            </button>
            </div>
        </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-8">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Pro Plan</CardTitle>
            <CardDescription>
              {isUSD ? "Pay securely with PayPal (USD)" : "Local payments via bKash (coming soon)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="text-4xl font-bold">
                {prices.pro}
                <span className="text-lg font-normal text-muted-foreground">
                    {prices.suffix}
                </span>
            </div>
            <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> All Core AI Tools</li>
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Business Plan Downloads</li>
                <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Company Profile Downloads</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
                onClick={() => handlePayment('pro')}
                disabled={!isUSD}
                className="w-full bg-slate-900 hover:bg-slate-800"
            >
                {isUSD ? "Pay with PayPal" : "Pay with bKash"}
            </Button>
          </CardFooter>
        </Card>

        <Card className={cn("w-full max-w-sm shadow-xl relative overflow-hidden", currentPlan === 'premium' && 'border-2 border-primary')}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold rounded-b-md">
                Most Popular
            </div>
          <CardHeader className="pt-10">
            <CardTitle className="text-2xl">Premium Plan</CardTitle>
            <CardDescription>
                {isUSD ? "Pay securely with PayPal (USD)" : "Local payments via bKash (coming soon)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">
                {prices.premium}
                <span className="text-lg font-normal text-muted-foreground">
                    {prices.suffix}
                </span>
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
                onClick={() => handlePayment('premium')}
                disabled={!isUSD}
                className="w-full"
                variant={isUSD ? "default" : "secondary"}
            >
                 {isUSD ? "Pay with PayPal" : "Pay with bKash"}
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
