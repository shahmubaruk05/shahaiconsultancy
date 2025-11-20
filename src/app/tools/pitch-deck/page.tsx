
"use client";

import { useState, useTransition, useEffect } from "react";
import { generatePitchDeckAction, savePitchDeckAction } from "./actions";
import PitchDeckViewer from "@/components/PitchDeckViewer";
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from "next/link";
import { Loader2, Download, Save } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockedPreview } from "@/components/LockedPreview";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'next/navigation';
import { logAiUsageClient } from "@/lib/ai-usage-client";

type UserPlan = 'free' | 'pro' | 'premium';

type FormDataObject = {
  startupName: string;
  oneLiner: string;
  industry: string;
  country: string;
  targetAudience: string;
  problem: string;
  solution: string;
  traction: string;
  revenueModel: string;
  competitors: string;
  fundingNeed: string;
  team: string;
};

export default function PitchDeckPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [result, setResult] = useState("");
  const [formData, setFormData] = useState<FormDataObject | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const [pptxDownloading, setPptxDownloading] = useState(false);
  
  const { user, isUserLoading, firestore } = useFirebase();
  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);
  const plan = (userData?.plan as UserPlan) || 'free';

  const [isProjectLoading, setIsProjectLoading] = useState(!!projectId);

  useEffect(() => {
    if (projectId && firestore && user) {
      const fetchProject = async () => {
        setIsProjectLoading(true);
        const projectDocRef = doc(firestore, `users/${user.uid}/pitchDecks`, projectId);
        const docSnap = await getDoc(projectDocRef);
        if (docSnap.exists()) {
          const projectData = docSnap.data()?.data;
          setResult(projectData.deckMarkdown);
          
          const form = document.getElementById('pitch-deck-form') as HTMLFormElement;
          if (form) {
            Object.keys(projectData).forEach(key => {
              if (form.elements.namedItem(key)) {
                (form.elements.namedItem(key) as HTMLInputElement).value = projectData[key];
              }
            });
          }
          setFormData(projectData);
        } else {
          toast({ variant: 'destructive', title: 'Project not found' });
        }
        setIsProjectLoading(false);
      };
      fetchProject();
    } else {
        setIsProjectLoading(false);
    }
  }, [projectId, firestore, user, toast]);

  function handleSubmit(formData: FormData) {
    setResult("");
    const dataObject = Object.fromEntries(formData.entries()) as FormDataObject;
    setFormData(dataObject);

    startGenerating(async () => {
      const r = await generatePitchDeckAction(formData);
      setResult(r.output || "");
      logAiUsageClient({
        tool: "pitch-deck",
        inputSummary: `${dataObject.startupName} | ${dataObject.industry}`,
        outputSummary: r.output,
        tokensApprox: null,
        meta: { slideCount: (r.output?.match(/###/g) || []).length },
      });
    });
  }

  function handleSave() {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please log in to save your project.' });
      return;
    }
    if (!result || !formData) return;
    
    startSaving(async () => {
      try {
        await savePitchDeckAction(formData, result);
        toast({ title: 'Project saved!', description: 'You can find it in your dashboard.' });
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Failed to save project.' });
      }
    });
  }

  async function handleDownloadPptx() {
    if (!result) return;
    try {
      setPptxDownloading(true);

      const startupNameInput = (
        document.querySelector('input[name="startupName"]') as HTMLInputElement | null
      )?.value;

      const res = await fetch("/api/pitch-deck/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: result,
          startupName: startupNameInput || "pitch-deck",
        }),
      });

      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Failed to create PPTX' });
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (startupNameInput || "pitch-deck") + "-pitch-deck.pptx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Failed to download PPTX' });
    } finally {
      setPptxDownloading(false);
    }
  }
  
  if (isUserLoading || isProjectLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user) {
    return (
      <Card className="m-auto mt-12 max-w-lg text-center p-8">
          <CardTitle>Please Log In</CardTitle>
          <CardDescription className="mt-2 mb-4">You need to be logged in to use this tool.</CardDescription>
          <Button asChild>
              <Link href="/login">Log In</Link>
          </Button>
      </Card>
    );
  }

  const isLocked = plan === 'free';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">
          Pitch Deck Assistant
        </h1>
        <p className="text-sm text-slate-600">
          Investor-ready 12–13 slide outline — problem, solution, market, business
          model, traction, financials, team &amp; funding ask.
        </p>
      </div>

      <form
        id="pitch-deck-form"
        action={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 rounded-xl p-4 bg-white shadow-sm"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Startup name
            </label>
            <input
              name="startupName"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ex: Farm2City"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              One-liner
            </label>
            <input
              name="oneLiner"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ex: Fresh farm products delivered to Dhaka city within 12 hours."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Industry
            </label>
            <input
              name="industry"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ex: Agri-tech, SaaS, E-commerce"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Country
            </label>
            <input
              name="country"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Bangladesh / USA / Global"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Target audience
            </label>
            <input
              name="targetAudience"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ex: Middle-income families in Dhaka, SMEs, freelancers"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Problem
            </label>
            <textarea
              name="problem"
              className="w-full min-h-[70px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="গ্রাহকদের মূল সমস্যাটা কী?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Solution
            </label>
            <textarea
              name="solution"
              className="w-full min-h-[70px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="আপনার সলিউশন কীভাবে কাজ করবে?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Traction (optional)
            </label>
            <textarea
              name="traction"
              className="w-full min-h-[60px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Users, revenue, pilots, LOIs, waitlist ইত্যাদি থাকলে লিখুন।"
            />
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Revenue model
            </label>
            <input
              name="revenueModel"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Subscription, commission, one-time fee, etc."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Competitors
            </label>
            <textarea
              name="competitors"
              className="w-full min-h-[60px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Similar apps, local competitors, alternatives."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Funding need
            </label>
            <input
              name="fundingNeed"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ex: $100k for 18 months runway."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Team overview
            </label>
            <textarea
              name="team"
              className="w-full min-h-[60px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Founder(s) background, key team members, advisors."
            />
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium shadow-sm disabled:opacity-60"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? "Generating pitch deck..." : "Generate Pitch Deck"}
          </button>
        </div>
      </form>

      {result && (
        <div id="preview-area">
          <LockedPreview
            isLocked={isLocked}
            title="Generated Pitch Deck Outline"
          >
            <PitchDeckViewer content={result} />
            {!isLocked && (
              <div className="flex items-center gap-2 mt-4">
                 <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Project"}
                  </Button>
                <Button
                  onClick={handleDownloadPptx}
                  disabled={pptxDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {pptxDownloading ? "Creating PPTX..." : "Download PPTX"}
                </Button>
              </div>
            )}
          </LockedPreview>
        </div>
      )}
    </div>
  );
}

