
"use client";
import { useState, useEffect, useTransition } from 'react';
import { useFirebase, useDoc, useMemoFirebase, useUser } from '@/firebase';
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

type UserPlan = "free" | "pro" | "premium";
type PlanType = "pro" | "premium" | null;

function BKashPaymentModal({
  open,
  onClose,
  plan,
  amountBdt,
}: {
  open: boolean;
  onClose: () => void;
  plan: PlanType;
  amountBdt: number | null;
}) {
  const { user } = useUser() || { user: null };
  const { firestore } = useFirebase();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [txId, setTxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
        setName(user.displayName || '');
        setEmail(user.email || '');
    }
  }, [user]);

  if (!open || !plan || !amountBdt) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !phone || !txId) {
      setError("সব ঘর পূরণ করুন (নাম, ইমেইল, মোবাইল, Transaction ID)।");
      return;
    }
    if (!firestore) {
        setError("Database connection not found.");
        return;
    }

    try {
      setLoading(true);
      await addDoc(collection(firestore, "bkashPayments"), {
        plan,
        amount: `${amountBdt} BDT`,
        name,
        email,
        phone,
        trxId: txId,
        uid: user?.uid || null,
        status: "pending",
        createdAt: serverTimestamp(),
        source: "pricing-page",
      });
      setSuccess(
        "ধন্যবাদ! আপনার bKash payment তথ্য রিসিভ হয়েছে। ২৪ ঘন্টার মধ্যে ভেরিফাই করা হবে।"
      );
      setName("");
      setEmail("");
      setPhone("");
      setTxId("");
    } catch (err: any) {
      console.error("Failed to save bkash payment", err);
      setError("ডাটা সেভ করতে সমস্যা হয়েছে, একটু পরে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Pay with bKash — {plan === "pro" ? "Pro Plan" : "Premium Plan"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-medium mb-1">Step 1: bKash payment পাঠান</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Merchant bKash: <span className="font-semibold">01711781232</span></li>
            <li>Amount: <span className="font-semibold">{amountBdt} BDT</span></li>
            <li>Payment type: <span className="font-semibold">Payment</span></li>
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Payment করার পর SMS/এপ-এ যে Transaction ID পাবেন, সেটা নিচের ফর্মে লিখুন।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                নাম
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                ইমেইল
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                মোবাইল নম্বর (bKash)
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Transaction ID
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="e.g. CHH0L3Y5JI"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-1">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-md px-2 py-1">
              {success}
            </p>
          )}

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit payment info"}
            </button>
          </div>
        </form>
      </div>
    </div>
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

  const [bkashOpen, setBkashOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  const [selectedAmountBdt, setSelectedAmountBdt] = useState<number | null>(
    null
  );

  const openBkashForPlan = (plan: PlanType) => {
    if (!plan) return;
    setSelectedPlan(plan);
    setSelectedAmountBdt(plan === "pro" ? 999 : 1999);
    setBkashOpen(true);
  };


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
      <BKashPaymentModal
        open={bkashOpen}
        onClose={() => setBkashOpen(false)}
        plan={selectedPlan}
        amountBdt={selectedAmountBdt}
      />
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
          <CardFooter className="flex-col items-stretch">
            {isUSD ? (
                <Button onClick={() => handlePaypalPayment('pro')} className="w-full bg-slate-900 hover:bg-slate-800">
                    Pay with PayPal
                </Button>
            ) : (
                <Button onClick={() => openBkashForPlan('pro')} className="w-full" variant="secondary">Pay with bKash</Button>
            )}
             <button
              onClick={() => openBkashForPlan("pro")}
              className="mt-3 w-full rounded-lg border border-pink-500 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50"
            >
              Pay with bKash (BDT)
            </button>
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
          <CardFooter className="flex-col items-stretch">
            {isUSD ? (
                <Button onClick={() => handlePaypalPayment('premium')} className="w-full">
                    Pay with PayPal
                </Button>
            ) : (
                <Button onClick={() => openBkashForPlan('premium')} className="w-full" variant="secondary">Pay with bKash</Button>
            )}
             <button
              onClick={() => openBkashForPlan("premium")}
              className="mt-3 w-full rounded-lg border border-pink-500 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50"
            >
              Pay with bKash (BDT)
            </button>
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
