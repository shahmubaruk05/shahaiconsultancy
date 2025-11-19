
"use client";
import { useState, useEffect, useTransition } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UserPlan = 'free' | 'pro' | 'premium';

function BKashPaymentModal({ plan, price, firestore, user }: { plan: 'pro' | 'premium', price: string, firestore: any, user: any }) {
    const { toast } = useToast();
    const [isSubmitting, startSubmitting] = useTransition();
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [trxId, setTrxId] = useState('');
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        if (!name || !email || !phone || !trxId) {
            toast({ variant: 'destructive', title: 'Please fill all fields.' });
            return;
        }

        startSubmitting(async () => {
            try {
                await addDoc(collection(firestore, 'bkashPayments'), {
                    name,
                    email,
                    phone,
                    trxId,
                    plan,
                    amount: price,
                    status: 'pending',
                    uid: user?.uid || null,
                    createdAt: serverTimestamp(),
                });
                toast({ title: 'Submission Received!', description: 'Your payment is being verified. Please allow up to 24 hours.' });
                setOpen(false);
            } catch (error) {
                console.error("bKash submission error:", error);
                toast({ variant: 'destructive', title: 'Submission Failed', description: 'Please try again later.' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full" variant="secondary">Pay with bKash</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Pay with bKash</DialogTitle>
                    <DialogDescription>
                        Send {price} to the number below, then submit your details.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className='text-center p-4 rounded-lg bg-secondary'>
                        <p className='text-sm text-muted-foreground'>bKash Merchant Number</p>
                        <p className='text-2xl font-bold'>01711781232</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Your Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Your Phone</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="trxId">bKash Transaction ID</Label>
                        <Input id="trxId" value={trxId} onChange={(e) => setTrxId(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

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
  
  const handlePaypalPayment = (plan: 'pro' | 'premium') => {
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
              {isUSD ? "Pay securely with PayPal (USD)" : "Local payments via bKash"}
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
            {isUSD ? (
                <Button onClick={() => handlePaypalPayment('pro')} className="w-full bg-slate-900 hover:bg-slate-800">
                    Pay with PayPal
                </Button>
            ) : (
                <BKashPaymentModal plan="pro" price={prices.pro} firestore={firestore} user={user} />
            )}
          </CardFooter>
        </Card>

        <Card className={cn("w-full max-w-sm shadow-xl relative overflow-hidden", currentPlan === 'premium' && 'border-2 border-primary')}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold rounded-b-md">
                Most Popular
            </div>
          <CardHeader className="pt-10">
            <CardTitle className="text-2xl">Premium Plan</CardTitle>
            <CardDescription>
                {isUSD ? "Pay securely with PayPal (USD)" : "Local payments via bKash"}
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
            {isUSD ? (
                <Button onClick={() => handlePaypalPayment('premium')} className="w-full">
                    Pay with PayPal
                </Button>
            ) : (
                <BKashPaymentModal plan="premium" price={prices.premium} firestore={firestore} user={user} />
            )}
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
