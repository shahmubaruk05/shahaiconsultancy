
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { generateBusinessStrategy } from '@/ai/flows/generate-business-strategy';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  businessModel: z.string().min(10, 'Please describe your business model in at least 10 characters.'),
  usp: z.string().min(10, 'Please describe your unique selling proposition in at least 10 characters.'),
  pricing: z.string().min(5, 'Please describe your pricing in at least 5 characters.'),
  marketingChannels: z.string().min(5, 'Please describe your marketing channels in at least 5 characters.'),
});

type FormData = z.infer<typeof formSchema>;

export function BusinessStrategyForm() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<Awaited<ReturnType<typeof generateBusinessStrategy>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessModel: '',
      usp: '',
      pricing: '',
      marketingChannels: '',
    },
  });

  const onSubmit = (data: FormData) => {
    if (!user || !firestore) return;
    
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const aiResult = await generateBusinessStrategy(data);
        setResult(aiResult);
        
        const strategyRef = collection(firestore, `users/${user.uid}/businessStrategies`);
        await addDoc(strategyRef, {
          userId: user.uid,
          ...data,
          ninetyDayActionPlan: aiResult.ninetyDayActionPlan,
          createdAt: serverTimestamp(),
        });

      } catch (e) {
        console.error(e);
        setError('An unexpected error occurred while generating the strategy. Please try again.');
      }
    });
  };

  if (isUserLoading) {
    return <div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Please Log In</CardTitle>
        <CardDescription className="mt-2 mb-4">You need to be logged in to generate a business strategy.</CardDescription>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Business Details</CardTitle>
              <CardDescription>Fill in the details below to generate your strategy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="businessModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Subscription-based service (SaaS)" {...field} />
                    </FormControl>
                    <FormDescription>How will your business create, deliver, and capture value?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unique Selling Proposition (USP)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., We are the only platform that uses AI to personalize user experience in real-time." {...field} />
                    </FormControl>
                    <FormDescription>What makes you different from the competition?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Strategy</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tiered pricing: Free, Pro ($20/mo), Enterprise ($100/mo)" {...field} />
                    </FormControl>
                    <FormDescription>How will you price your product or service?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marketingChannels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marketing Channels</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Content marketing, social media (LinkedIn), partnerships" {...field} />
                    </FormControl>
                    <FormDescription>How will you reach your target customers?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} size="lg">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Strategy
            </Button>
          </div>
        </form>
      </Form>

      {isPending && (
        <div className="mt-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">AI is crafting your business strategy...</p>
        </div>
      )}

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Generated Business Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Business Strategy</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.businessStrategy}</p>
            </div>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold mb-2">90-Day Action Plan</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.ninetyDayActionPlan}</p>
            </div>
          </CardContent>
        </Card>
      )}
       {error && (
        <Card className="mt-8 border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                <CardDescription className="text-destructive/80">{error}</CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
