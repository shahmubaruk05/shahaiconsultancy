'use client';

import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { validateStartupIdeaAction } from '@/app/actions/validate-startup-idea';
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

const formSchema = z.object({
  ideaDescription: z.string().min(50, 'Please provide a detailed description of at least 50 characters.'),
});

export function StartupValidatorForm() {
  const [state, formAction] = useFormState(validateStartupIdeaAction, { success: false });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ideaDescription: '',
    },
  });

  const { isSubmitting } = form.formState;

  return (
    <div>
      <Form {...form}>
        <form action={form.handleSubmit(data => formAction(data))} className="space-y-6">
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
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validate Idea
            </Button>
          </div>
        </form>
      </Form>

      {isSubmitting && (
        <div className="mt-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">AI is analyzing your idea...</p>
        </div>
      )}

      {state.success && state.data && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>Here's the AI's analysis of your startup idea.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-semibold">Viability Score</h3>
                <span className="text-2xl font-bold text-primary">{state.data.score}/100</span>
              </div>
              <Progress value={state.data.score} className="h-3" />
            </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-muted-foreground">{state.data.summary}</p>
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
                    {state.data.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
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
                    {state.data.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
