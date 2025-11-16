'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { useToast } from "@/hooks/use-toast";

import { generateBusinessPlanMock, BusinessPlanResult, BusinessPlanInput } from '@/lib/aiMock';
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
  CardFooter
} from '@/components/ui/card';
import { Loader2, Download, Printer, ExternalLink } from 'lucide-react';
import { Input } from '../ui/input';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { saveAs } from 'file-saver';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters.'),
  industry: z.string().min(3, 'Please specify your industry.'),
  country: z.string().min(2, 'Country is required.'),
  targetAudience: z.string().min(10, 'Please describe your target audience.'),
  problem: z.string().min(10, 'Please describe the problem you are solving.'),
  solution: z.string().min(10, 'Please describe your solution.'),
  revenueModel: z.string().min(3, 'Please describe your revenue model.'),
  fundingNeed: z.string().optional(),
  planDepth: z.enum(['quick', 'pro']),
});

type FormData = z.infer<typeof formSchema>;
type UserPlan = 'free' | 'pro' | 'premium';


const ResultSection = ({ title, content }: { title: string; content: string | string[] }) => (
  <div>
    <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
    {Array.isArray(content) ? (
      <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
        {content.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    ) : (
      <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
    )}
  </div>
);

async function downloadBusinessPlanDocx(plan: BusinessPlanResult, inputValues: FormData) {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "Shah Mubaruk – Your Startup Coach",
              heading: HeadingLevel.TITLE,
              style: "Title"
            }),
            new Paragraph({
              text: inputValues.businessName || "Business Plan",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph(" "),
            new Paragraph({
              text: "Executive Summary",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(plan.executiveSummary || ""),
            new Paragraph(" "),
            new Paragraph({
              text: "Market Analysis",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(plan.marketAnalysis || ""),
            new Paragraph(" "),
            new Paragraph({
              text: "Marketing Plan",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(plan.marketingPlan || ""),
            new Paragraph(" "),
            new Paragraph({
              text: "Operations Plan",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(plan.operationsPlan || ""),
            new Paragraph(" "),
            new Paragraph({
              text: "Financial Overview",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(plan.financialOverview || ""),
            new Paragraph(" "),
            new Paragraph({
              text: "Next Steps",
              heading: HeadingLevel.HEADING_2,
            }),
            ...(plan.nextSteps || []).map(
              (step: string) =>
                new Paragraph({
                  text: step,
                  bullet: { level: 0 },
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${inputValues.businessName || "business-plan"}-shah-mubaruk.docx`);
  }

export function BusinessPlanForm() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BusinessPlanResult | null>(null);
  const [formValues, setFormValues] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);
  const plan = (userData?.plan as UserPlan) || 'free';


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      industry: '',
      country: 'Bangladesh',
      targetAudience: '',
      problem: '',
      solution: '',
      revenueModel: '',
      fundingNeed: '',
      planDepth: 'pro',
    },
  });

  const onSubmit = (data: FormData) => {
    if (!user) return;
    
    setError(null);
    setResult(null);
    setFormValues(data);

    startTransition(async () => {
      try {
        const aiResult = await generateBusinessPlanMock(data);
        setResult(aiResult);
        
        const planRef = collection(firestore, `users/${user.uid}/businessPlans`);
        await addDoc(planRef, {
          userId: user.uid,
          ...data,
          ...aiResult,
          createdAt: serverTimestamp(),
        });

      } catch (e) {
        console.error(e);
        setError('An unexpected error occurred. Please try again.');
      }
    });
  };

  const handleDownload = () => {
    if (plan === 'free') {
      toast({
        variant: "destructive",
        title: "Upgrade Required",
        description: (
          <div>
            DOCX export is available for Pro & Premium users only.
            <Button variant="link" asChild className="p-0 h-auto ml-2 text-white">
                <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </div>
        ),
      });
      return;
    }
    if (result && formValues) {
      downloadBusinessPlanDocx(result, formValues);
    }
  };


  if (isUserLoading) {
    return <div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Please Log In</CardTitle>
        <CardDescription className="mt-2 mb-4">You need to be logged in to generate a business plan.</CardDescription>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                      <CardTitle>Your Business Details</CardTitle>
                      <CardDescription>Provide the details for your new business plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="businessName" render={({ field }) => ( <FormItem><FormLabel>Business Name</FormLabel><FormControl><Input placeholder="e.g., Spark Innovators Ltd." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="industry" render={({ field }) => ( <FormItem><FormLabel>Industry / Sector</FormLabel><FormControl><Input placeholder="e.g., Tech Education, SaaS, E-commerce" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="targetAudience" render={({ field }) => ( <FormItem><FormLabel>Target Audience</FormLabel><FormControl><Textarea placeholder="e.g., early-stage founders, SMEs, local entrepreneurs" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="problem" render={({ field }) => ( <FormItem><FormLabel>Problem Statement</FormLabel><FormControl><Textarea placeholder="What main problem are you solving?" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="solution" render={({ field }) => ( <FormItem><FormLabel>Solution Overview</FormLabel><FormControl><Textarea placeholder="How are you solving this problem?" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="revenueModel" render={({ field }) => ( <FormItem><FormLabel>Revenue Model</FormLabel><FormControl><Input placeholder="e.g., subscription, commission, B2B service" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="fundingNeed" render={({ field }) => ( <FormItem><FormLabel>Funding Need (Optional)</FormLabel><FormControl><Input placeholder="e.g., $10k for MVP, $50k for seed round" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField
                            control={form.control}
                            name="planDepth"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Plan depth</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select plan depth" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="quick">Quick summary</SelectItem>
                                    <SelectItem value="pro">Investor-ready (recommended)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                 <div className="flex justify-between items-center">
                    <Button type="submit" disabled={isPending} size="lg">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Business Plan
                    </Button>
                    {result && (
                        <Button variant="outline" onClick={() => router.push('/')}>
                            Back to Dashboard
                        </Button>
                    )}
                </div>
                </form>
            </Form>
        </div>
        <div>
            {isPending && (
                <Card className="flex flex-col items-center justify-center p-8 h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Generating your business plan...</p>
                </Card>
            )}

            {!isPending && !result && (
              <Card className="flex flex-col items-center justify-center p-8 h-full text-center">
                  <CardTitle>Your Plan Awaits</CardTitle>
                  <CardDescription className="mt-2">Fill in the form and click 'Generate Business Plan' to see your plan here.</CardDescription>
              </Card>
            )}

            {result && formValues && (
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Business Plan</CardTitle>
                        <CardDescription>Here is the AI-generated plan for your business.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ResultSection title="Executive Summary" content={result.executiveSummary} />
                        <ResultSection title="Market Analysis" content={result.marketAnalysis} />
                        <ResultSection title="Marketing Plan" content={result.marketingPlan} />
                        <ResultSection title="Operations Plan" content={result.operationsPlan} />
                        <ResultSection title="Financial Overview" content={result.financialOverview} />
                        <ResultSection title="Next Steps" content={result.nextSteps} />
                    </CardContent>
                    <CardFooter className="flex-col sm:flex-row gap-2">
                        <div className="w-full">
                           <Button
                                onClick={handleDownload}
                                className="w-full sm:w-auto"
                            >
                                <Download className="mr-2" /> Download as Word (.docx)
                            </Button>
                            {plan === 'free' && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    DOCX export is available on Pro/Premium plans.
                                </p>
                            )}
                        </div>
                        <Button onClick={() => window.print()} variant="outline" className='w-full sm:w-auto'>
                           <Printer className="mr-2" /> Print / Save as PDF
                        </Button>
                    </CardFooter>
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
    </div>
  );
}
