
"use client";

import { useState, useTransition, useEffect } from "react";
import { generatePitchDeckAction } from "./actions";
import PitchDeckViewer from "@/components/PitchDeckViewer";
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserPlan = 'free' | 'pro' | 'premium';

export default function PitchDeckPage() {
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pptxDownloading, setPptxDownloading] = useState(false);
  
  const { user, isUserLoading, firestore } = useFirebase();
  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);
  const plan = (userData?.plan as UserPlan) || 'free';

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
  }, [result]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const r = await generatePitchDeckAction(formData);
      setResult(r.output || "");
    });
  }

  async function handleCopy() {
    if (!result) return;
    try {
      setCopying(true);
      await navigator.clipboard.writeText(result);
      alert("Pitch deck text copied! এখন Canva / PowerPoint / Google Slides এ paste করতে পারবেন।");
    } catch (e) {
      console.error(e);
      alert("কপি করতে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।");
    } finally {
      setCopying(false);
    }
  }

  function handleDownload() {
    if (!result) return;
    setDownloading(true);
    try {
      const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pitch-deck-outline.md";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
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
        alert("PPTX তৈরি করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
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
      alert("PPTX download করতে সমস্যা হয়েছে।");
    } finally {
      setPptxDownloading(false);
    }
  }
  
  if (isUserLoading) {
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

  const previewClass = plan === 'free' ? 'locked-preview' : 'pro-preview';

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
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm disabled:opacity-60"
          >
            {isPending ? "Generating pitch deck..." : "Generate Pitch Deck"}
          </button>
        </div>
      </form>

      {result && (
        <div id="preview-area" className={cn("space-y-3 mt-4", previewClass)}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Generated Pitch Deck Outline
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={copying}
                className="px-3 py-1.5 rounded-md border border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-60"
              >
                {copying ? "Copying..." : "Copy all"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="px-3 py-1.5 rounded-md bg-slate-900 text-xs font-medium text-white hover:bg-black disabled:opacity-60"
              >
                {downloading ? "Downloading..." : "Download .md"}
              </button>
              <button
                type="button"
                onClick={handleDownloadPptx}
                disabled={pptxDownloading}
                className="px-3 py-1.5 rounded-md bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {pptxDownloading ? "Creating PPTX..." : "Download PPTX"}
              </button>
            </div>
          </div>

          <PitchDeckViewer content={result} />
        </div>
      )}
    </div>
  );
}
