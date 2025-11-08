'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { generatePitchDeckOutlineAction } from '@/app/actions/generate-pitch-deck';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const formSchema = z.object({
  businessName: z.string().min(1, 'Business name is required.'),
  businessDescription: z.string().min(20, 'Please provide a description of at least 20 characters.'),
  targetAudience: z.string().min(10, 'Please describe your target audience.'),
  problemStatement: z.string().min(20, 'Please describe the problem you are solving.'),
  solutionStatement: z.string().min(20, 'Please describe your solution.'),
  uniqueSellingProposition: z.string().min(20, 'Please describe your USP.'),
  valueProposition: z.string().min(20, 'Please describe your value proposition.'),
  revenueModel: z.string().min(10, 'Please describe your revenue model.'),
  marketSize: z.string().min(5, 'Please describe the market size.'),
  competitiveLandscape: z.string().min(10, 'Please describe the competitive landscape.'),
  financialProjections: z.string().min(10, 'Please provide your financial projections.'),
  fundingRequirements: z.string().min(10, 'Please describe your funding requirements.'),
});

export function PitchDeckForm() {
  const [state, formAction] = useActionState(generatePitchDeckOutlineAction, { success: false });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        businessName: '',
        businessDescription: '',
        targetAudience: '',
        problemStatement: '',
        solutionStatement: '',
        uniqueSellingProposition: '',
        valueProposition: '',
        revenueModel: '',
        marketSize: '',
        competitiveLandscape: '',
        financialProjections: '',
        fundingRequirements: '',
    },
  });

  const { isSubmitting } = form.formState;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(data => formAction(data))} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pitch Deck Inputs</CardTitle>
              <CardDescription>The more detail you provide, the better the outline will be.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField control={form.control} name="businessName" render={({ field }) => ( <FormItem><FormLabel>Business Name</FormLabel><FormControl><Input placeholder="e.g., SparkleClean" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="targetAudience" render={({ field }) => ( <FormItem><FormLabel>Target Audience</FormLabel><FormControl><Input placeholder="e.g., Busy urban professionals aged 25-40" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="businessDescription" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Business Description</FormLabel><FormControl><Textarea placeholder="A brief, high-level overview of your business." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="problemStatement" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Problem</FormLabel><FormControl><Textarea placeholder="What specific problem are you solving for your target audience?" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="solutionStatement" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Solution</FormLabel><FormControl><Textarea placeholder="How does your product or service solve this problem?" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="uniqueSellingProposition" render={({ field }) => ( <FormItem><FormLabel>Unique Selling Proposition</FormLabel><FormControl><Input placeholder="e.g., Eco-friendly products, 24/7 service" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="valueProposition" render={({ field }) => ( <FormItem><FormLabel>Value Proposition</FormLabel><FormControl><Input placeholder="e.g., Save time, save money, improve health" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="revenueModel" render={({ field }) => ( <FormItem><FormLabel>Revenue Model</FormLabel><FormControl><Input placeholder="e.g., Monthly subscription, pay-per-use" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="marketSize" render={({ field }) => ( <FormItem><FormLabel>Market Size (TAM, SAM, SOM)</FormLabel><FormControl><Input placeholder="e.g., $1B TAM, $100M SAM" {...field} /></FormControl><FormMessage /></FormMessage /></FormItem>)} />
              <FormField control={form.control} name="competitiveLandscape" render={({ field }) => ( <FormItem><FormLabel>Competitors</FormLabel><FormControl><Input placeholder="e.g., Company A, Company B" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="financialProjections" render={({ field }) => ( <FormItem><FormLabel>Financial Projections</FormLabel><FormControl><Input placeholder="e.g., 3-year revenue forecast" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="fundingRequirements" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Funding Requirements</FormLabel><FormControl><Textarea placeholder="How much are you asking for, and how will you use it?" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Pitch Deck Outline
            </Button>
          </div>
        </form>
      </Form>

      {isSubmitting && (
        <div className="mt-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">AI is building your pitch deck outline...</p>
        </div>
      )}

      {state.success && state.data && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Generated Pitch Deck Outline</CardTitle>
            <CardDescription>Use these suggestions to build each slide of your presentation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
              {state.data.map((slide, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg font-semibold">{index + 1}. {slide.slideTitle}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                      {slide.slideContentSuggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
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
