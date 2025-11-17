
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { useToast } from "@/hooks/use-toast";
import { saveAs } from 'file-saver';
import ReactMarkdown from 'react-markdown';

import { generateCompanyProfileMock } from '@/lib/aiMock';
import { saveCompanyProfile } from '@/lib/company-profile';
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
import { Loader2, Download, Printer, History, FileText } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
  depth: z.enum(['quick', 'detailed', 'investor']),
});

type FormData = z.infer<typeof formSchema>;
type UserPlan = 'free' | 'pro' | 'premium';
type ProfileDocument = { 
    id: string; 
    createdAt: any; 
    profileMarkdown: string; 
    depth: string; 
    companyName: string;
};


export function CompanyProfileForm() {
  const { user, isUserLoading, firestore } = useFirebase();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMarkdown, setPreviewMarkdown] = useState<string | null>(null);
  const [activeProfileName, setActiveProfileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);
  
  const profilesQuery = useMemoFirebase(() => 
    user && firestore ? query(collection(firestore, `users/${user.uid}/companyProfiles`), orderBy('createdAt', 'desc'), limit(5)) : null,
    [user, firestore]
  );
  const { data: savedProfiles, isLoading: profilesLoading } = useCollection<ProfileDocument>(profilesQuery);

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
      depth: 'quick'
    },
  });

  const plan = (userData?.plan as UserPlan) || 'free';

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

  const onSubmit = async (data: FormData) => {
    if (!user || !firestore) return;
    
    setError(null);
    setPreviewMarkdown(null);
    setActiveProfileName(data.companyName);
    setIsGenerating(true);

    try {
      const aiResult = await generateCompanyProfileMock(data);
      
      const profileMarkdown = Object.entries(aiResult)
          .map(([key, value]) => `## ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n\n${value}`)
          .join('\n\n');

      setPreviewMarkdown(profileMarkdown);
      
      await saveCompanyProfile(firestore, user.uid, {
          companyName: data.companyName,
          industry: data.industry,
          country: data.country,
          depth: data.depth,
          profileMarkdown: profileMarkdown,
      });

    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred. Please try again.');
    } finally {
        setIsGenerating(false);
    }
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
    if (previewMarkdown && activeProfileName) {
      downloadCompanyProfileDocx(previewMarkdown, activeProfileName);
    }
  };


  async function downloadCompanyProfileDocx(profileMarkdown: string, companyName: string) {
    const docx = new Document({
      sections: [{
        children: [
          new Paragraph({ text: companyName, heading: HeadingLevel.TITLE }),
          new Paragraph({ text: "Generated by Shah Mubaruk's AI Startup Coach", style: "IntenseQuote" }),
          ...profileMarkdown.split('\n').map(line => {
            if (line.startsWith('## ')) return new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } });
            if (line.startsWith('# ')) return new Paragraph({ text: line.substring(2), heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
            if (line.trim().startsWith('- ')) return new Paragraph({ text: line.trim().substring(2), bullet: { level: 0 } });
            return new Paragraph(line);
          })
        ],
      }],
    });
    const blob = await Packer.toBlob(docx);
    saveAs(blob, `${companyName.replace(/ /g, '_') || "company-profile"}-shah-mubaruk.docx`);
  }


  return (
    <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
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
                         <FormField
                            control={form.control}
                            name="depth"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                <FormLabel>Profile Depth</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="quick">Quick overview (≈ 1 page)</SelectItem>
                                        <SelectItem value="detailed">Detailed company profile (2–3 pages)</SelectItem>
                                        <SelectItem value="investor">Investor-ready profile (3–5 pages)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="text-muted-foreground">
                                    <ul className="text-xs list-disc pl-4 mt-2">
                                        <li><b>Quick overview:</b> 1 page, good for website About page</li>
                                        <li><b>Detailed profile:</b> 2–3 pages, good for proposals & brochures</li>
                                        <li><b>Investor-ready:</b> 3–5 pages, for sharing with serious investors</li>
                                    </ul>
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isGenerating} size="lg" className="w-full md:w-auto ml-auto">
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Profile
                      </Button>
                    </CardFooter>
                </Card>
                </form>
            </Form>
        </div>
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5" /> Saved Profiles</CardTitle>
                    {profilesLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                </CardHeader>
                <CardContent>
                    {savedProfiles && savedProfiles.length > 0 ? (
                        <div className="space-y-2">
                            {savedProfiles.map(profile => (
                                <button key={profile.id} onClick={() => { setPreviewMarkdown(profile.profileMarkdown); setActiveProfileName(profile.companyName); }} className="w-full text-left p-2 rounded-md hover:bg-secondary transition-colors">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium truncate">{profile.companyName}</p>
                                        <Badge variant="outline" className="capitalize">{profile.depth}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{new Date(profile.createdAt.toDate()).toLocaleDateString()}</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">No saved profiles yet.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="sticky top-4">
                <CardHeader>
                    <CardTitle>Generated Company Profile</CardTitle>
                </CardHeader>
                 <CardContent className="min-h-[300px]">
                    {isGenerating ? (
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ) : previewMarkdown ? (
                        <div className="prose max-w-none dark:prose-invert">
                           <ReactMarkdown>{previewMarkdown}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <FileText className="h-10 w-10 mx-auto mb-2" />
                            <p>Your generated profile will appear here.</p>
                        </div>
                    )}
                </CardContent>
                {previewMarkdown && (
                     <CardFooter className="flex-col items-start gap-4">
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                           <Button
                                onClick={handleDownload}
                                className="w-full sm:w-auto"
                                disabled={!previewMarkdown}
                            >
                               <Download className="mr-2" /> Download as Word (.docx)
                            </Button>
                             <Button onClick={() => window.print()} variant="outline" className='w-full sm-w-auto' disabled={!previewMarkdown}>
                               <Printer className="mr-2" /> Print / Save as PDF
                            </Button>
                        </div>
                        {plan === 'free' && (
                            <p className="text-xs text-muted-foreground">
                                DOCX export is available on Pro/Premium plans.
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">Written in collaboration with Shah Mubaruk – Your Startup Coach.</p>
                    </CardFooter>
                )}
            </Card>

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
