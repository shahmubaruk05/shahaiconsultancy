
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Document, Packer, Paragraph, HeadingLevel } from "docx";

import { generateCompanyProfileMock, CompanyProfileResult, CompanyProfileInput } from '@/lib/aiMock';
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
  CardFooter,
} from '@/components/ui/card';
import { Loader2, Download, Printer } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  industry: z.string().min(3, 'Please specify your industry.'),
  country: z.string().min(2, 'Country is required.'),
  targetCustomers: z.string().min(10, 'Please describe your target customers.'),
  servicesOrProducts: z.string().min(10, 'Please list your services or products.'),
  brandTone: z.enum(['Formal', 'Friendly', 'Mixed']),
  language: z.enum(['English', 'Bangla']),
  companySize: z.enum(['Startup (1–10)', 'SME (11–50)', 'Growing (51–200)', 'Corporate (200+)']),
  foundedYear: z.string().min(4, 'Please enter a valid year.').optional().or(z.literal('')),
  coreValue: z.string().optional(),
  marketFocus: z.enum(['Local', 'Regional', 'International']),
  sustainability: z.string().optional(),
  keyStrengths: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ResultSection = ({ title, content }: { title: string; content: string }) => {
    if (!content) return null;
    return (
        <div>
            <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
        </div>
    );
};

async function downloadCompanyProfileDocx(profile: CompanyProfileResult, inputValues: FormData) {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "BizSpark – Shah Mubaruk – Your Startup Coach",
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              text: inputValues.companyName || "Company Profile",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph(" "),
            new Paragraph({
              text: "About Us",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(profile.about || ""),
             new Paragraph(" "),
            new Paragraph({
              text: "Mission",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(profile.mission || ""),
             new Paragraph(" "),
            new Paragraph({
              text: "Vision",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(profile.vision || ""),
             new Paragraph(" "),
            new Paragraph({
              text: "Our Services",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(profile.servicesSummary || ""),
             new Paragraph(" "),
            new Paragraph({
              text: "Our Customers",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(profile.targetCustomersSection || ""),
             new Paragraph(" "),
            new Paragraph({
              text: "Why Choose Us",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(profile.whyChooseUs || ""),
            ...(profile.socialImpact ? [
                new Paragraph(" "),
                new Paragraph({
                    text: "Sustainability / Social Impact",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph(profile.socialImpact),
            ] : []),
             new Paragraph(" "),
            new Paragraph({
              text: "Call to Action",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(profile.callToAction || ""),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inputValues.companyName || "company-profile"}-shah-mubaruk.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


export function CompanyProfileForm() {
  const { firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<CompanyProfileResult | null>(null);
  const [formValues, setFormValues] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      industry: 'Technology',
      country: 'Bangladesh',
      targetCustomers: '',
      servicesOrProducts: '',
      brandTone: 'Friendly',
      language: 'English',
      companySize: 'Startup (1–10)',
      foundedYear: '',
      coreValue: '',
      marketFocus: 'Local',
      sustainability: '',
      keyStrengths: '',
    },
  });

  const onSubmit = (data: FormData) => {
    if (!user) return;
    
    setError(null);
    setResult(null);
    setFormValues(data);

    startTransition(async () => {
      try {
        const aiResult = await generateCompanyProfileMock(data);
        setResult(aiResult);
        
        const profileRef = collection(firestore, `users/${user.uid}/companyProfiles`);
        await addDoc(profileRef, {
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

  if (isUserLoading) {
    return <div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Please Log In</CardTitle>
        <CardDescription className="mt-2 mb-4">You need to be logged in to create a company profile.</CardDescription>
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
                        <CardTitle>Your Company Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="companyName" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="e.g., Spark Innovators Ltd." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="industry" render={({ field }) => ( <FormItem><FormLabel>Industry / Sector</FormLabel><FormControl><Input placeholder="e.g., Technology, Agro, Education" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="targetCustomers" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Target Customers</FormLabel><FormControl><Textarea placeholder="e.g., early-stage founders, SMEs, local entrepreneurs" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="servicesOrProducts" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Services / Products</FormLabel><FormControl><Textarea placeholder="e.g., Business consulting, software development, online courses" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="brandTone" render={({ field }) => ( <FormItem><FormLabel>Brand Tone</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Formal">Formal</SelectItem><SelectItem value="Friendly">Friendly</SelectItem><SelectItem value="Mixed">Mixed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="language" render={({ field }) => ( <FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Bangla">Bangla</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="companySize" render={({ field }) => ( <FormItem><FormLabel>Company Size</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Startup (1–10)">Startup (1–10)</SelectItem><SelectItem value="SME (11–50)">SME (11–50)</SelectItem><SelectItem value="Growing (51–200)">Growing (51–200)</SelectItem><SelectItem value="Corporate (200+)">Corporate (200+)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="marketFocus" render={({ field }) => ( <FormItem><FormLabel>Market Focus</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Local">Local</SelectItem><SelectItem value="Regional">Regional</SelectItem><SelectItem value="International">International</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="foundedYear" render={({ field }) => ( <FormItem><FormLabel>Founded Year</FormLabel><FormControl><Input placeholder="e.g., 2023" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="coreValue" render={({ field }) => ( <FormItem><FormLabel>Core Value / Motto</FormLabel><FormControl><Input placeholder="e.g., Innovation for Impact" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="keyStrengths" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Key Strengths (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Experienced team, patented technology, strong distribution network" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="sustainability" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Sustainability or Social Impact (Optional)</FormLabel><FormControl><Textarea placeholder="Describe your social or environmental initiatives" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
                 <div className="flex justify-between items-center">
                    <Button type="submit" disabled={isPending} size="lg">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Profile
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
                    <p className="mt-4 text-muted-foreground">Generating your company profile...</p>
                </Card>
            )}

            {!isPending && !result && (
              <Card className="flex flex-col items-center justify-center p-8 h-full text-center">
                  <CardTitle>Your Profile Awaits</CardTitle>
                  <CardDescription className="mt-2">Fill in the form and click 'Generate Profile' to see your company profile here.</CardDescription>
              </Card>
            )}

            {result && formValues && (
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Company Profile</CardTitle>
                        <CardDescription>Here is the AI-generated profile for your company.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ResultSection title="About Us" content={result.about} />
                        <ResultSection title="Mission" content={result.mission} />
                        <ResultSection title="Vision" content={result.vision} />
                        <ResultSection title="Our Services" content={result.servicesSummary} />
                        <ResultSection title="Our Customers" content={result.targetCustomersSection} />
                        <ResultSection title="Why Choose Us" content={result.whyChooseUs} />
                        <ResultSection title="Sustainability / Social Impact" content={result.socialImpact} />
                        <ResultSection title="Call to Action" content={result.callToAction} />
                    </CardContent>
                    <CardFooter className="flex-col sm:flex-row gap-2">
                        <Button onClick={() => downloadCompanyProfileDocx(result, formValues)} className='w-full sm:w-auto'>
                           <Download className="mr-2" /> Download as Word (.docx)
                        </Button>
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
