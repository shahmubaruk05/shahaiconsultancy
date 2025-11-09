'use client';
import { useState } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [selectedPlan, setPlan] = useState<'pro' | 'premium'>('pro');
  const { user } = useUser();
  const router = useRouter();

  const checkout = async (plan: 'pro' | 'premium') => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout session creation failed:', data.error);
      }
    } catch (error) {
        console.error('An error occurred during checkout:', error);
    }
  };

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
            <Button onClick={() => checkout('pro')} className="w-full" size="lg">
              Subscribe to Pro
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full max-w-sm shadow-xl border-2 border-primary relative overflow-hidden">
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
            <Button onClick={() => checkout('premium')} className="w-full bg-accent hover:bg-accent/90" size="lg">
              Subscribe to Premium
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
