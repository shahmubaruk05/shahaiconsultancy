
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { validateStartupIdea } from '@/ai/flows/validate-startup-idea';
import {
  Form,
  FormControl,
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
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


const formSchema = z.object({
  ideaDescription: z.string().min(50, 'Please provide a detailed description of at least 50 characters.'),
});

type FormData = z.infer<typeof formSchema>;


export function StartupValidatorForm() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<Awaited<ReturnType<typeof validateStartupIdea>> | null>(null);
  const [error, setError] = useState<string | null>(null);


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ideaDescription: '',
    },
  });

  const onSubmit = (data: FormData) => {
    if (!user || !firestore) return;
    
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const aiResult = await validateStartupIdea({ ideaDescription: data.ideaDescription });
        setResult(aiResult);

        const ideaRef = collection(firestore, `users/${user.uid}/startupIdeas`);
        await addDoc(ideaRef, {
          userId: user.uid,
          input: data.ideaDescription,
          score: aiResult.score,
          summary: aiResult.summary,
          risks: aiResult.risks.join(', '),
          recommendations: aiResult.recommendations.join(', '),
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.error(e);
        setError('An unexpected error occurred. Please try again.');
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
        <CardDescription className="mt-2 mb-4">You need to be logged in to validate an idea.</CardDescription>
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
              <CardTitle>Describe Your Idea</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="ideaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Idea Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., An app that connects local farmers directly with consumers to sell fresh produce, reducing waste and providing better prices for both."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} size="lg">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validate Idea
            </Button>
          </div>
        </form>
      </Form>

      {isPending && (
        <div className="mt-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">AI is analyzing your idea...</p>
        </div>
      )}

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>Here's the AI's analysis of your startup idea.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-semibold">Viability Score</h3>
                <span className="text-2xl font-bold text-primary">{result.score}/100</span>
              </div>
              <Progress value={result.score} className="h-3" />
            </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-muted-foreground">{result.summary}</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="recommendations">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">Recommendations</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="risks">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <span className="font-semibold">Potential Risks</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {result.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
