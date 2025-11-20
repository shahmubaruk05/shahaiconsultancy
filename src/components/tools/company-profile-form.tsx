
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
import { cn } from '@/lib/utils';
import { LockedPreview } from "@/components/LockedPreview";
import { logAiUsageClient } from '@/lib/ai-usage-client';


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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [previewMarkdown, setPreviewMarkdown] = useState<string>("");
  const [activeProfileName, setActiveProfileName] = useState<string>('');
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
      depth: 'quick'
    },
  });

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);
  
  const profilesQuery = useMemoFirebase(() => 
    user && firestore ? query(collection(firestore, `users/${user.uid}/companyProfiles`), orderBy('createdAt', 'desc'), limit(5)) : null,
    [user, firestore]
  );
  const { data: savedProfiles, isLoading: profilesLoading } = useCollection<ProfileDocument>(profilesQuery);

  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
  
    const preview = document.getElementById("preview-area");
    if (!preview) return;
  
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "c" || e.key === "a" || e.key === "x")) {
        e.preventDefault();
      }
    };
  
    preview.addEventListener("copy", block);
    preview.addEventListener("cut", block);
    preview.addEventListener("contextmenu", block);
    preview.addEventListener("keydown", handleKeyDown);
  
    return () => {
      preview.removeEventListener("copy", block);
      preview.removeEventListener("cut", block);
      preview.removeEventListener("contextmenu", block);
      preview.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewMarkdown]);

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

  const isLocked = plan === 'free';
  
  const onSubmit = async (data: FormData) => {
    if (!user || !firestore) return;
    
    setError(null);
    setPreviewMarkdown("");
    setActiveProfileName(data.companyName);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/company-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to generate profile");

      const profileMarkdown = result.profile || result.reply || "";
      setPreviewMarkdown(profileMarkdown);
      
      await saveCompanyProfile(firestore, user.uid, {
          companyName: data.companyName,
          industry: data.industry,
          country: data.country,
          depth: data.depth,
          profileMarkdown: profileMarkdown,
      });

      logAiUsageClient({
        tool: "company-profile",
        inputSummary: `${data.companyName} | ${data.industry} | ${data.country}`,
        outputSummary: profileMarkdown,
        meta: { style: data.depth },
      });

    } catch (e: any) {
      console.error("Company profile generation failed:", e);
      setError(e.message || 'An unexpected error occurred. Please try again.');
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (isLocked) {
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
  
  const handleDownloadPdf = async () => {
    if (isLocked) {
        toast({
            variant: "destructive",
            title: "Upgrade Required",
            description: "PDF export is available for Pro & Premium users only.",
          });
        return;
    }
    if (!previewMarkdown) return;
    setIsDownloadingPdf(true);
    try {
      const res = await fetch("/api/company-profile/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileMarkdown: previewMarkdown,
          companyName: form.getValues().companyName,
          industry: form.getValues().industry,
          country: form.getValues().country,
        }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName =
        (form.getValues().companyName || "company-profile")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "company-profile";
      a.download = `${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      toast({
        variant: "destructive",
        title: "PDF Download Failed",
        description: "There was an error generating your PDF. Please try again.",
      });
    } finally {
      setIsDownloadingPdf(false);
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
                                        <SelectItem value="detailed">Detailed profile (2–3 pages)</SelectItem>
                                        <SelectItem value="investor">Investor-ready profile (3–5 pages)</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    <p className="text-xs text-muted-foreground">
                                        {profile.createdAt && typeof (profile.createdAt as any).toDate === 'function'
                                          ? new Date((profile.createdAt as any).toDate()).toLocaleDateString()
                                          : 'Draft (no date)'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">No saved profiles yet.</p>
                    )}
                </CardContent>
            </Card>

            <div id="preview-area" className="sticky top-4">
                {isGenerating ? (
                    <Card className="flex flex-col items-center justify-center p-8 h-full min-h-[300px]">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="mt-4 text-muted-foreground">Generating your profile...</p>
                    </Card>
                ) : previewMarkdown ? (
                  <LockedPreview isLocked={isLocked} title="Generated Company Profile">
                      <article className="prose max-w-none dark:prose-invert">
                          <ReactMarkdown>{previewMarkdown}</ReactMarkdown>
                      </article>
                      {!isLocked && (
                          <CardFooter className="flex-col items-start gap-4 mt-4 p-0">
                              <div className="flex flex-col sm:flex-row gap-2 w-full">
                                <Button
                                      onClick={handleDownload}
                                      className="w-full sm:w-auto"
                                      disabled={!previewMarkdown}
                                  >
                                    <Download className="mr-2" /> Download as Word (.docx)
                                  </Button>
                                  <Button onClick={handleDownloadPdf} variant="outline" className='w-full sm:w-auto' disabled={!previewMarkdown || isDownloadingPdf}>
                                    {isDownloadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2" />}
                                    Download as PDF
                                  </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">Written in collaboration with Shah Mubaruk – Your Startup Coach.</p>
                          </CardFooter>
                      )}
                  </LockedPreview>
                ) : (
                    <Card className="flex flex-col items-center justify-center p-8 h-full min-h-[300px] text-center">
                        <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Fill in the form and click <strong>Generate Profile</strong>. Your AI-generated company profile will appear here.</p>
                    </Card>
                )}
            </div>

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
