'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { generateBusinessStrategyAction } from '@/app/actions/generate-business-strategy';
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

const formSchema = z.object({
  businessModel: z.string().min(20, 'Please describe your business model in at least 20 characters.'),
  usp: z.string().min(20, 'Please describe your unique selling proposition in at least 20 characters.'),
  pricing: z.string().min(10, 'Please describe your pricing in at least 10 characters.'),
  marketingChannels: z.string().min(10, 'Please describe your marketing channels in at least 10 characters.'),
});

export function BusinessStrategyForm() {
  const [state, formAction] = useActionState(generateBusinessStrategyAction, { success: false });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessModel: '',
      usp: '',
      pricing: '',
      marketingChannels: '',
    },
  });

  const { isSubmitting } = form.formState;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(data => formAction(data))} className="space-y-6">
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
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Strategy
            </Button>
          </div>
        </form>
      </Form>

      {isSubmitting && (
        <div className="mt-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">AI is crafting your business strategy...</p>
        </div>
      )}

      {state.success && state.data && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Generated Business Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Business Strategy</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{state.data.businessStrategy}</p>
            </div>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold mb-2">90-Day Action Plan</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{state.data.ninetyDayActionPlan}</p>
            </div>
          </CardContent>
        </Card>
      )}
       {!state.success && state.message && (
        <Card className="mt-8 border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                <CardDescription className="text-destructive/80">{state.message}</CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
